<?php

/**
 * ROUTE
 * /users
 *
 * Implemented: all_get, all_post, one_get, one_put, one_delete
 *
 * Additional: regulation_put, field_put
 *
 * TODO: move additional routes to their own route classes / remove them
 */
class Route_Users extends Route {


  /**
   * GET
   * /users
   */
  public function all_get() {
    self::authorize(null, 32);

    $params = self::$app->request()->params();
    $args = array();

    $limit = '';
    if (! empty($params['limit'])) {
      $limit = 'LIMIT ?';
      $args[] = $params['limit'];
    }

    $select = "SELECT
        username,
        rank,
        type
      FROM users
      $limit
    ";

    $stmt = self::$db->prepare($select);
    $stmt->execute($args);
    $result = self::$db->fetchAllAssoc($stmt);
    $this->ok($result);
  }


  /**
   * POST
   * /users
   *
   * At the moment there is no way to create new users - they are automatically
   * created when authorized using LDAP but not yet available in our local
   * database. This should be made available to create accounts for users who
   * can not authorize using LDAP. For example demo and administration accounts.
   *
   * Not implemented.
   */
  public function all_post() {
    return false;
  }


  /**
   * GET
   * /users/:username
   *
   * @param {string} $username
   * @param {assoc}  $options
   */
  public function one_get($username) {
    extract(self::args(func_get_args(), array(
      'username',
      'options'
    )));

    $user = self::authorize($username);

    // regulation
    $regulation = self::$db->sql_select_one(
      array('students_in_regulations', 'regulations'), array(
        'username' => md5($username),
        'regulation_id' => $user['regulation_id'],
      ), array(
        'regulation_id',
        'regulation_title',
        'regulation_abbr',
        'regulation',
        'examination_fields',
        'thesis_title',
        'thesis_grade',
        'overview_order',
        'overview_columns',
      )
    );
    $user = array_merge($user, !empty($regulation) ? $regulation : array() );

    // get this users courses
    $user_courses = new Route_Users_Courses();
    $user['courses'] = $user_courses->all_get($username, array(
      'user'   => $user,
      'return' => true
    ));

    // fields
    $user['fields'] = $this->get_fields($username, $user['regulation_id']);

    // Function might be called from another api function, return result instead
    // of sending it down the wire directly.
    if (! empty($options['return']) && $options['return']) {
      return $user;
    }

    $this->ok($user);
  }


  /**
   * PUT
   * /users/:username
   *
   * @param $username
   */
  public function one_put($username) {
    self::authorize($username);

    $set = array();
    $cols = array(
      'firstname',
      'lastname',
      'mat_term',
      'mat_year',
      'mat_verify'
    );

    foreach ($cols AS $col) {
      if (isset(self::$params[ $col ])) {
        $set[ $col ] = self::$params[ $col ];
      }
    }

    $args[] = md5($username);

    if (! empty($set)) {
      self::$db->sql_update('students', array(
        'username' => md5($username),
      ), $set);
    }

    return $this->one_get($username);
  }


  /**
   * DELETE
   * /users/:username
   *
   * @param $username
   */
  public function one_delete($username) {
    self::authorize($username);
    self::$db->sql_delete('users', array('username' => md5($username)));
    $this->no_content();
  }


  /**
   * PUT
   * /users/:username/fields/:field_id
   *
   * @param $username
   * @param $field_id
   */
  public function field_put($username, $field_id) {
    $user = self::authorize($username);
    $data = self::$params;

    if (empty($field_id)) {
      return $this->bad_request();
    }

    $userhash = md5($username);
    $regulation_id = $user['regulation_id'];
    $grade = !empty($data['grade']) ? $data['grade'] : null;
    $minimized = !empty($data['minimized']) ? !!$data['minimized'] : false;

    $select = array(
      'username' => $userhash,
      'field_id' => $field_id,
      'regulation_id' => $regulation_id
    );

    $set = array(
      'grade' => $grade,
      'minimized' => $minimized
    );

    // delete
    if (empty($grade) && !$minimized) {
      self::$db->sql_delete('students_in_fields', $select);
      $this->no_content();
      return;
    }

    $put = self::$db->sql_put('students_in_fields', $select, $set);

    if (!$put) {
      $this->bad_request();
      return;
    }

    $put['username'] = $username;
    $this->ok($put);
  }


  /**
   * DELETE
   * /users/:username/regulations/:regulation_id
   *
   * @param $username
   * @param $regulation_id
   */
  public function regulation_put($username, $regulation_id) {
    $user = self::authorize($username);
    $data = self::$params;

    $put = self::$db->sql_put(
      'students_in_regulations',
      array(
        'username'      => md5($username),
        'regulation_id' => (int) $regulation_id,
      ),
      array_map(array('DB', 'sanitize'), array_pick($data, array(
        'thesis_title',
        'thesis_grade',
        'overview_order',
        'overview_columns'
      )))
    );

    $put['username'] = $username;
    $this->ok($put);
  }


  /**
   * Fetches the fields in relation to the current user from the database.
   *
   * @param  $username
   * @param  $regulation_id
   * @return array
   */
  private function get_fields($username, $regulation_id) {
    $args = array(
      ':username'      => md5($username),
      ':regulation_id' => $regulation_id,
    );

    $fields = self::$db->sql_select(
      array('fields', 'fields_in_regulations'),
      array('regulation_id' => $regulation_id),
      array('field_id', 'field', 'field_examination_possible',
            'field_pm', 'field_wpm'),
          //'field_abbr','field_desc','field_in_regulation_id','regulation_id'
      array('style' => 'groupassoc')
    );

    $userfields = self::$db->sql_select(
      'students_in_fields',
      array('username' => md5($username)),
      array('field_id', 'student_in_field_id', 'grade', 'minimized'),
          //'username', 'regulation_id', 'one_of_five'
      array('style' => 'groupassoc')
    );

    $result = array();
    foreach ($fields as $field_id => $field) {
      $result[] = array_merge($field, array(
          'field_id' => $field_id,
          'minimized' => false,
        ),
        !empty($userfields[$field_id]) ? $userfields[$field_id] : array()
      );
    }

    return $result;
  }


}
