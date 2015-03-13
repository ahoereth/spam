<?php

/**
 * ROUTE
 * /users/:username/courses
 *
 * Implemented: all_get, all_post, one_get, one_put, one_delete
 */
class Route_Users_Courses extends Route {


  /**
   * GET
   * /users/:username/courses
   *
   * @param $username
   * @param $args     optional array
   *          $course_id
   *          $return
   */
  public function all_get() {
    extract(self::args(func_get_args(), array(
      'username',
      'args'
    )));

    extract($args);

    // only the user himself has access here
    $user = self::authorize($username);

    $args = array(
      ':username'      => md5($username),
      ':regulation_id' => $user['regulation_id']
    );

    $get_one = "";
    if (! empty($student_in_course_id)) {
      $get_one = "AND sc.student_in_course_id = :student_in_course_id";
      $args[":student_in_course_id"] = $student_in_course_id;
    }

    $select = "SELECT
      -- courses
      c.code,
      c.course_id,
      c.course,
      c.ects,
      c.term,
      c.year,
      c.hours,
      c.studip_url,

      -- students_in_courses
      sc.student_in_course_id,
      sc.grade,
      sc.passed,
      sc.muted,
      sc.unofficial_code,
      sc.unofficial_course,
      sc.unofficial_ects,
      sc.unofficial_term,
      sc.unofficial_year,

      -- courses in fields in regulations
      cfr.field_id,
      cfr.field_abbr,
      cfr.field,
      cfr.regulation_id,

      -- user is enrolled in all courses we fetch here
      1 AS enrolled,

      -- primary course_in_field_type
      UPPER( pcf.course_in_field_type ) AS enrolled_course_in_field_type,

      -- enrolled_field_id
      CASE WHEN sc.field_id IS NOT NULL
        THEN sc.field_id
        ELSE 1
      END AS enrolled_field_id

    FROM students_in_courses AS sc

      LEFT JOIN courses
        AS c
        ON (sc.course_id = c.course_id)

      -- primary courses_in_fields
      LEFT JOIN courses_in_fields
        AS pcf
        ON (
          sc.field_id = pcf.field_id AND
          sc.course_id = pcf.course_id
        )

      -- courses in fields in regulations
      LEFT JOIN (
        SELECT
          cf.course_id,
          f.field_id,
          f.field_abbr,
          f.field,
          fr.regulation_id
        FROM
          courses_in_fields AS cf,
          fields_in_regulations AS fr,
          fields AS f
        WHERE
          fr.field_id = cf.field_id AND
          fr.regulation_id = :regulation_id AND
          f.field_id = cf.field_id
      )
        AS cfr
        ON (cfr.course_id = sc.course_id)

    WHERE
      sc.username = :username AND
      (sc.regulation_id = :regulation_id OR sc.regulation_id IS NULL)
      {$get_one}

    ORDER BY
      c.course_id ASC,
      sc.field_id ASC,
      c.year ASC,
      c.term ASC;
    ";

    $stmt = self::$db->prepare( $select );
    $stmt->execute( $args );

    $courses = Course::aggregate_courses( $stmt );

    if (! empty($return) && $return) {
      return $courses;
    } else {
      $this->ok($courses);
    }
  }


  /**
   * POST
   * /users/:username/courses
   *
   * @param $username
   * @param $data     Optional. Can contain alternative course_id and field_id.
   */
  public function all_post() {
    extract(self::args(func_get_args(), array(
      'username',
      'data'
    )));

    $user = self::authorize($username);

    $post = json_decode(self::$app->request()->getBody(), true);

    $course_id = ! empty($post['course_id']) ? (int) $post['course_id'] : null;
    $field_id  = ! empty($post['field_id' ]) ? (int) $post['field_id' ] : null;
    $field_id  = $field_id !== 1 ? $field_id : null;

    if (empty($course_id) && empty($post['unofficial_course'])) {
      return $this->bad_request();
    }

    // perform some checks if the user tries to enroll in an existing course
    if (! empty($course_id)) {
      $args = array(
        ':course_id' => $course_id,
      );

      $field = '';
      if (! empty($field_id)) {
        $args[':field_id']      = $field_id;
        $args[':regulation_id'] = $user['regulation_id'];

        $field = "AND field_id = :field_id AND regulation_id = :regulation_id";
      }

      $select = "SELECT
          course_id,
          parent_course_id,
          preliminary
        FROM courses c
        NATURAL LEFT JOIN courses_in_fields cf
        NATURAL LEFT JOIN fields f
        NATURAL LEFT JOIN fields_in_regulations fr
        WHERE
          c.course_id = :course_id
          {$field}
        LIMIT 1;
      ";

      $get = self::$db->prepare($select);
      $get->execute($args);

      // course does not exist OR course does not exist in
      // this field & regulation
      if (! $course = $get->fetch(PDO::FETCH_ASSOC)) {
        return $this->bad_request();
      }

      // course is a subcourse of some other course -->
      // put the student into the parent course
      if ($course['parent_course_id']) {
        return $this->all_post($username, array(
          'course_id' => $course['parent_course_id'],
          'field_id'  => $field_id,
        ));
      }

      // students cannot join preliminary courses
      if ($course['preliminary']) {
        return $this->bad_request();
      }
    }

    $set = array();
    $unofficials = array(
      'unofficial_code',
      'unofficial_course',
      'unofficial_ects',
      'unofficial_term',
      'unofficial_year',
    );
    foreach ($unofficials AS $unofficial) {
      if (isset($post[$unofficial])) {
        $set[$unofficial] = $post[$unofficial];
      }
    }

    $set = array_merge($set, array(
      'username'  => md5($username),
      'course_id' => $course_id,
      'field_id'  => $field_id,
      'regulation_id' => $user['regulation_id'],
    ));

    $insert = self::$db->sql_insert('students_in_courses', $set);

    if (! $insert) {
      return $this->bad_request();
    }

    $student_in_course_id = self::$db->sql_select_one(
      'students_in_courses',
      $set,
      'student_in_course_id'
    );

    return $this->one_get($username, $student_in_course_id);
  }


  /**
   * GET
   * /users/:username/courses/:student_in_course_id
   *
   * @param $username
   * @param $student_in_course_id
   */
  public function one_get($username) {
    extract( self::args( func_get_args(), array(
      'username',
      'student_in_course_id',
    )));

    $args = array(
      'student_in_course_id' => $student_in_course_id,
      'return' => true
    );

    $courses = $this->all_get($username, $args);
    $this->ok($courses[0]);
  }


  /**
   * PUT
   * /users/:username/courses/:course_id
   *
   * @param $username
   * @param $course_id
   */
  public function one_put($username) {
    extract(self::args(func_get_args(), array(
      'username',
      'student_in_course_id',
    )));

    self::authorize($username);

    if (empty($student_in_course_id)) {
      return $this->bad_request();
    }

    $put = self::$params;
    $set = array();

    // grade
    if (isset($put['grade'])) {
      $grade = (float) preg_replace(
        '/[^\\d.]+/', '', str_replace(',', '.', $put['grade'])
      );
      $grade = $grade < 1 || $grade > 5 ? ($grade > 5 ? 5 : null) : $grade;
      $set['grade'] = $grade;
      $set['passed'] = $grade >= 1 && $grade <= 4 ? 1 : 0;
    }

    // passed
    if (isset($put['passed'])) {
      $set['passed'] = (int) $put['passed'];
    }

    // muted
    if (isset($put['muted'])) {
      $set['muted']= (int) $put['muted'] > 0 ? 1 : 0;
    }

    // enrolled_field_id
    if (isset($put['enrolled_field_id'])) {
      $id = (int) $put['enrolled_field_id'];
      $set['field_id'] = $id > 1 ? $id : null;
    }

    self::$db->sql_update('students_in_courses', array(
      'student_in_course_id' => $student_in_course_id,
      'username' => md5($username),
    ), $set);

    return $this->one_get($username, $student_in_course_id);
  }


  /**
   * DELETE
   * /users/:username/courses/:student_in_course_id
   *
   * @param $username
   * @param $student_in_course_id
   */
  public function one_delete($username) {
    extract(self::args( func_get_args(), array(
      'username',
      'student_in_course_id',
    )));

    self::authorize($username);

    self::$db->sql_delete('students_in_courses', array(
      'username' => md5($username),
      'student_in_course_id' => $student_in_course_id,
    ));

    $this->no_content();
  }


}
