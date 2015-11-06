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
      c.course_id,
      c.hours,
      c.studip_url,

      -- students_in_courses
      sc.student_in_course_id,
      sc.grade,
      sc.passed,
      sc.muted,

      CASE WHEN sc.unofficial_code IS NOT NULL
           THEN sc.unofficial_code ELSE c.code
      END AS code,

      CASE WHEN sc.unofficial_course IS NOT NULL
           THEN sc.unofficial_course ELSE c.course
      END AS course,

      CASE WHEN sc.unofficial_ects IS NOT NULL
           THEN sc.unofficial_ects ELSE c.ects
      END AS ects,

      CASE WHEN sc.unofficial_term IS NOT NULL
           THEN sc.unofficial_term ELSE c.term
      END AS term,

      CASE WHEN sc.unofficial_year IS NOT NULL
           THEN sc.unofficial_year ELSE c.year
      END AS year,

      -- courses in fields in regulations
      cfr.field_id,
      cfr.field_abbr,
      cfr.field,
      cfr.regulation_id,

      -- user is enrolled in all courses we fetch here
      1 AS enrolled,

      -- primary course_in_field_type
      UPPER(pcf.course_in_field_type) AS enrolled_course_in_field_type,

      -- enrolled_field_id
      CASE WHEN sc.field_id IS NOT NULL
           THEN sc.field_id ELSE 1
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
      year ASC,
      term ASC,
      course ASC;
    ";

    $stmt = self::$db->prepare($select);
    $stmt->execute($args);

    $courses = Course::aggregate_courses($stmt);

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
   */
  public function all_post() {
    extract(self::args(func_get_args(), array(
      'username',
    )));

    return $this->one_put($username);
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
   * /users/:username/courses/:student_in_course_id
   *
   * @param $username
   * @param $student_in_course_id
   */
  public function one_put($username) {
    extract(self::args(func_get_args(), array(
      'username',
      'student_in_course_id',
    )));

    $user = self::authorize($username);

    $payload = self::$params;
    $toupdate = false;
    $set = array(
      'username' => md5($user['username']),
      'regulation_id' => $user['regulation_id'],
    );

    $selector = array( 'username' => md5($username) );
    if ($student_in_course_id) {
      $selector['student_in_course_id'] = $student_in_course_id;
    }

    // enrolled_field_id / field_id
    $field_id = false;
    if (!empty($payload['enrolled_field_id'])) {
      $field_id = (int) $payload['enrolled_field_id'];
    } elseif (!empty($payload['field_id'])) {
      $field_id = (int) $payload['field_id'];
    }
    if ($field_id) {
      $set['field_id'] = $field_id > 1 ? $field_id : null;
      $toupdate = true;
    }

    // course_id
    if (isset($payload['course_id'])) {
      $set['course_id'] = (int) $payload['course_id'];
      $toupdate = true;

      $selectors = array( 'course_id' => $set['course_id'] );
      if (array_key_exists('field_id', $set)) {
        $selectors['field_id'] = $set['field_id'];
        $selectors['regulation_id'] = $user['regulation_id'];
      }

      $course = self::$db->sql_select_one(
        array('courses', 'courses_in_fields', 'fields_in_regulations'),
        $selectors,
        array('course_id', 'parent_course_id', 'preliminary')
      );

      if (!$course) {
        return $this->bad_request();
      }

      // Course is a subcourse of some other course... Redirect the request.
      if ($course['parent_course_id']) {
        $selectors['course_id'] = $course['parent_course_id'];
        $course = self::$db->sql_select_one(
          array('courses', 'courses_in_fields', 'fields_in_regulations'),
          $selectors,
          array('course_id', 'parent_course_id', 'preliminary')
        );
        self::$params['course_id'] = $course['course_id'];
        return $this->one_put($username, $student_in_course_id);
      }

      // Students cannot join preliminary courses.
      if ($course['preliminary']) {
        return $this->bar_request();
      }
    }

    // 'unoffical' course information
    $infofields = array('course', 'code', 'ects', 'term', 'year');
    $info = array_pick($payload, $infofields);
    if (!empty($info)) {
      if (!empty($student_in_course_id)) {
        $current = self::$db->sql_select_one('students_in_courses', array(
          'student_in_course_id' => $student_in_course_id,
        ));

        if (!empty($current['course_id'])) {
          // Saving unofficial info for an official course.
          $course = self::$db->sql_select_one('courses', array(
            'course_id' => $current['course_id'],
          ));

          $diff = array_diff_assoc($info, array_pick($course, $infofields));
          $info = array_pick($info, array_keys($diff));
        } else {
          // Empty course name, year, term not allowed.
          if (empty($info['course'])) { $info['course'] = $current['course']; }
          if (empty($info['year'])) { $info['year'] = get_current_term_year(); }
          if (empty($info['term'])) { $info['term'] = get_current_term(); }
        }
      }

      // Course info changes only allowed for unofficial courses currently.
      if (empty($set['course_id']) || !$set['course_id']) {
        $set = array_merge($set, prefix_keys($info, 'unofficial_'));
        $toupdate = true;
      }
    }

    // grade
    if (array_key_exists('grade', $payload)) {
      $grade = (float) preg_replace(
        '/[^\\d.]+/', '', str_replace(',', '.', $payload['grade'])
      );
      $grade = $grade < 1 || $grade > 5 ? ($grade > 5 ? 5 : null) : $grade;
      $set['grade'] = $grade;
      $set['passed'] = $grade >= 1 && $grade <= 4 ? 1 : 0;
      $toupdate = true;
    }

    // passed
    if (isset($payload['passed'])) {
      $set['passed'] = (int) $payload['passed'];
      $toupdate = true;
    }

    // muted
    if (isset($payload['muted'])) {
      $set['muted']= (int) $payload['muted'] > 0 ? 1 : 0;
      $toupdate = true;
    }

    if ($toupdate) {
      $new = self::$db->sql_put('students_in_courses', $selector, $set);
      $student_in_course_id = $new['student_in_course_id'];
    }

    if (!empty($student_in_course_id)) {
      return $this->one_get($username, $student_in_course_id);
    } else {
      return $this->no_content();
    }
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
