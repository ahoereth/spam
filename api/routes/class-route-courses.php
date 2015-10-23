<?php

/**
 * ROUTE
 * /courses
 *
 * Implemented: all_get, all_post, one_get, one_put, one_delete
 */
class Route_Courses extends Route {


  /**
   * GET
   * /courses
   */
  public function all_get() {
    $user = self::authorize(null, null, false);

    $params = self::$app->request()->params();
    $regulation_id = ! empty($params['regulation_id']) ?
      $params['regulation_id'] : null;

    // which fields to select?
    $select = array(
      'course' => array(
        'c.course_id',
        'code',
        'course',
        'course_group',
        'type',
        'ects',
        'term',
        'year',
        'course_desc',
        'language',
        'course_notice',
        'studip_url',
      ),

      'teacher' => array(
        'teacher',
        't.teacher_id',
        'teacher_in_course_position',
      ),

      'field' => array(
        'field',
        'f.field_id',
        'course_in_field_type',
        'regulation_id',
      //  'regulation',
      //  'regulation_abbr',
      ),
    );

    // init
    $where_course = array(TRUE);
    $args = array();

    // lower boundary
    if (! empty($params['lower'])) {
      $where_course['year'] = 'year >= :year';
      $args['year'] = $params['lower'];
    }

    // upper boundary
    if (! empty($params['upper'])) {
      $where_course[':year'] = 'year <= :year2';
      $args[':year2'] = $params['upper'];
    }

    // query courses with teachers
    $q = sprintf("SELECT
      %s

      FROM (
        SELECT %s
        FROM courses c
        WHERE %s
        ORDER BY c.year DESC, c.term DESC, c.course ASC
      ) AS c

      LEFT JOIN teachers_in_courses tc ON tc.course_id = c.course_id
      LEFT JOIN teachers t ON t.teacher_id = tc.teacher_id

      LEFT JOIN courses_in_fields cf ON cf.course_id = c.course_id
      LEFT JOIN fields_in_regulations fr ON fr.field_id = cf.field_id
      LEFT JOIN fields f ON f.field_id = fr.field_id;",

      multi_implode(',', $select),
      multi_implode(',', $select['course']),
      multi_implode(' AND ', $where_course)
    );

    $stmt = self::$db->prepare($q);

    // query
    $sql_time = microtime(true);
    $stmt->execute($args);
    $sql_time = microtime(true) - $sql_time;

    // aggregate
    $aggregate_time = microtime(true);

    $courses = Course::aggregate_courses($stmt, $regulation_id);
    $aggregate_time = microtime(true) - $aggregate_time;

    $wrap = array(
      'sql_time' => $sql_time,
      'aggregate_time' => $aggregate_time,
      'sql_count' => $stmt->rowCount(),
      'aggregate_count' => count($courses),
      'data' => $courses
    );

    $this->ok($wrap);
  }


  /**
   * POST
   * /courses
   */
  public function all_post() {
    // use the existing put functionality, it also can handle requests
    // without id and will just insert a new course
    $this->one_put(null);
  }


  /**
   * GET
   * /courses/:course_id
   */
  public function one_get($course_id) {
    $params = self::$app->request()->params();

    $stmt = self::$db->prepare("SELECT
        c.*,
        t.teacher,
        t.teacher_id,
        tc.teacher_in_course_position,
        f.field,
        f.field_id,
        cf.course_in_field_type,
        fr.regulation_id,
        r.regulation,
        r.regulation_abbr
      FROM courses c
      NATURAL LEFT JOIN teachers_in_courses tc
      NATURAL LEFT JOIN teachers t
      NATURAL LEFT JOIN courses_in_fields cf
      NATURAL LEFT JOIN fields f
      NATURAL LEFT JOIN fields_in_regulations fr
      NATURAL LEFT JOIN regulations r
      WHERE
        c.course_id = :course_id
        # The official lectures index ignores this parameter.
        # AND r.invisible != 1
      ORDER BY c.course_id DESC;"
    );

    $args = array(
      ':course_id' => $course_id
    );

    $stmt->execute($args);

    if (! $stmt->rowCount()) {
      return $this->no_content();
    }

    $course = array();
    while ($c = self::$db->fetchAssoc($stmt)) {
      $course = Course::aggregate_course($course, $c);
    }

    $this->ok($course);
  }


  /**
   * PUT
   * /courses/:course_id
   */
  public function one_put($course_id) {
    $user = self::authorize(null, 4);
    $userhash = md5($user['username']);

    $request = self::$params;

    $course = new Course(array_merge(
      $request,
      array('course_id' => $course_id)
    ));

    $course->find_pk();

    if (! $course->is_deployable()) {
      return $this->bad_request('not enough data');
    }

    // Only users with a rank higher than 16 are allowed to make direct course
    // edits. If the rank is lower we only insert a proposal to the database.
    if ($user['rank'] < 16) {
      // If already editing a child course make the new child a child of the
      // parent course so we do not end up in a huge hierarchy.
      if ($parent_course_id = $course->get_parent_course_id()) {
        $course->set_pk_value($parent_course_id);
      }

      // Check if user already made a proposal related to this course.
      $proposal_id = self::$db->sql_select_one('courses', array(
        'parent_course_id' => $course->get_pk_value(),
        'modified_by'      => $userhash,
      ), 'course_id');

      // If we found a pending proposal update it instead of creating a
      // second proposal.
      if ($proposal_id) {
        $course->set_pk_value($proposal_id);
      } else {
        // Create new proposal.
        $course->make_child();
      }

      // Users with rank lower than 16 are only allowed to insert or updated
      // proposals (child courses).
      $course->set('preliminary', true);
    }

    // Multiple database updates coming, lets use a transaction.
    self::$db->beginTransaction();

    // Remember who is editing.
    $course->set('modified_by', $userhash);

    // Updates existing or creates new course.
    $course->save();
    $course->update_fields($request['fields']);
    $course->update_teachers($request['teachers']);


    // ok we are done, commit all database changes
    self::$db->commit();

    // return the updated course
    $this->one_get($course->get_pk_value());
  }


  /**
   * DELETE
   * /courses/:course_id
   */
  public function one_delete($course_id) {
    self::authorize(null, 32);

    if (Course::remove($course_id)) {
      $this->no_content();
    } else {
      $this->bad_request();
    }
  }


  /**
   * POST
   * /courses/find
   *
   * Find course_ids by using some course data. Used when migrating courses
   * from the IKW database to the SPAM database.
   *
   * This is a POST route because it transmits an amount of information to
   * the server which cannot be handled by GET query parameters.
   */
  public function find_many() {
    self::authorize(null, 32);

    $many = self::$params;
    $ids = array();
    foreach ($many AS $data) {
      $course = new Course($data);
      if ($id = $course->find_pk()) {
        $ids[$data['key']] = $course->find_pk();
      }
    }

    $this->ok($ids);
  }


}
