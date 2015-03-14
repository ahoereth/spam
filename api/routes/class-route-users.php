<?php

/**
 * ROUTE
 * /users
 *
 * Implemented: all_get, all_post, one_get, one_put, one_delete
 *
 * Additional: !
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
   * @param $username
   */
  public function one_get($username) {
    $user = self::authorize($username);

    // get this users courses
    $user_courses = new Route_Users_Courses();
    $user['courses'] = $user_courses->all_get($username, array(
      'user'   => $user,
      'return' => true
    ));

    // regulation
    $user = array_merge($user, self::$db->sql_select_one('regulations', array(
      'regulation_id' => $user['regulation_id'],
    )));

    // fields
    $user['fields'] = $this->get_fields($username, $user['regulation_id']);

    // thesis
    $user['thesis'] = $this->get_thesis($username, $user['regulation_id']);

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

    $userhash = md5($username);
    $regulation_id = $user['regulation_id'];
    $grade = ! empty(self::$params['grade']) ? self::$params['grade'] : null;

    if (empty($field_id)) {
      return $this->bad_request();
    }

    $select = array(
      'username' => $userhash,
      'field' => $field_id,
      'regulation_id' => $regulation_id
    );

    // delete
    if (empty($grade)) {
      self::$db->sql_delete('student_in_fields', $select);
      $this->no_content();
      return;
    }

    $put = self::$db->sql_put('students_in_fields', $select, array(
      'grade' => $grade
    ));

    if (! $put) {
      $this->bad_request();
      return;
    }

    $this->ok(array_merge($select, array(
      'grade' => $grade,
      'username' => $username
    )));
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
    $put = self::$params;

    $put = self::$db->sql_put(
      'students_in_regulations',
      array(
        'username'      => md5($username),
        'regulation_id' => (int) $regulation_id,
      ),
      array(
        'thesis_title' => ! empty($put['title']) ? $put['title'] : null,
        'thesis_grade' => ! empty($put['grade']) ? $put['grade'] : null,
      )
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

    $fields = "SELECT *
      FROM fields
      NATURAL LEFT JOIN fields_in_regulations
      NATURAL LEFT JOIN (
        SELECT *
        FROM students_in_fields
        WHERE username = :username
      ) AS sf
      WHERE regulation_id = :regulation_id
    ";

    $stmt = self::$db->prepare($fields);
    $stmt->execute($args);
    $fields = self::$db->fetchAllAssoc($stmt);
    return $fields;
  }


  private function get_thesis($username, $regulation_id) {
    $thesis = self::$db->sql_select_one(
      'students_in_regulations',
      array(
        'username' => md5($username),
        'regulation_id' => $regulation_id,
      ),
      array(
        'thesis_title AS title',
        'thesis_grade AS grade',
      )
    );

    return ! empty($thesis) ? $thesis : array('title' => null, 'grade' => null);
  }


}
