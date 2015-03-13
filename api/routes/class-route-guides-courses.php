<?php

/**
 * ROUTE
 * /guides/#/courses
 *
 * Implemented: all_get, one_get, one_put
 *
 * TODO: Figure out the Route_Guides_Courses and Route_Guides relationship.
 */
class Route_Guides_Courses extends Route {


  /**
   * GET
   * /guides/:regulation_id/courses
   */
  public function all_get($regulation_id = null) {
    $regulation_id = ! empty( $regulation_id ) ? $regulation_id : 1;
    $params = self::$params;

    $args = array();

    $semester = '';
    if (! empty($params['semester'])) {
      $semester = "semester = ? AND";
      $args[] = $params['semester'];
    }

    $args[] = $regulation_id;

    $q = "SELECT *
      FROM courses
      NATURAL JOIN courses_in_fields
      NATURAL LEFT JOIN fields
      NATURAL LEFT JOIN fields_in_regulations
      NATURAL LEFT JOIN regulations
      NATURAL LEFT JOIN teachers_in_courses
      NATURAL LEFT JOIN teachers
      NATURAL LEFT JOIN guide
      WHERE
        $semester
        regulation_id = ? AND
        ( ( year = ? AND term = ? ) OR
          ( year = ? AND term = ? )
        ) AND (
          (
            UPPER(course_in_field_type) = 'PM' AND (
              guide_inc = TRUE OR
              guide_inc IS NULL
            )
          ) OR
          guide_inc = TRUE
        )
      ORDER BY semester ASC, course ASC;
    ";

    $y = empty($params['year']) ?
      get_current_term_year() : intval($params['year']);
    $t = empty($params['term']) ?
      get_current_term() : strtoupper($params['term']);

    if ($t === 'S') {
      $args = array_merge($args, array($y, $t, $y, 'W'));
    } else {
      $args = array_merge($args, array($y, $t, $y+1, 'S'));
    }

    $get = self::$db->prepare($q);
    $get->execute($args);

    $courses = Course::aggregate_courses($get);
    $this->ok($courses);
  }


  /**
   * POST
   * /guides/:regulation_id/courses
   *
   * Not implemented.
   */
  public function all_post() {
    return false;
  }


  /**
   * GET
   * /guides/:regulation_id/courses/:course_id
   */
  public function one_get($regulation_id) {
    extract(self::args(func_get_args(), array(
      'regulation_id',
      'course_id',
    )));

    $args = array(
      $course_id
    );

    $q = "SELECT
        field_id,
        guide_inc
      FROM guide
      WHERE
        course_id = ?;";

    $get = self::$db->prepare($q);
    $get->execute($args);

    $guides = array();
    while ($guide = self::$db->fetchAssoc($get)) {
      $guides[ $guide['field_id'] ] = $guide['guide_inc'];
    }

    $guides = array_map('intval', $guides);
    echo json_encode($guides, JSON_FORCE_OBJECT); // hack
  }


  /**
   * PUT
   * /guides/:regulation_id/courses/:course_id
   */
  public function one_put($regulation_id) {
    extract(self::args(func_get_args(), array(
      'regulation_id',
      'course_id',
    )));

    $put = json_decode( self::$app->request()->getBody(), true);
    unset( $put['course_id'] );

    $q = "SELECT field_id, guide_inc FROM guide WHERE course_id = ?;";
    $select = self::$db->prepare($q);
    $select->execute(array($course_id));

    $get = array();
    while ($g = self::$db->fetchAssoc($select)) {
      $get[ $g['field_id'] ] = $g['guide_inc'];
    }

    $diff = array_udiff_assoc($put, $get, function($a, $b) {
      if ($a == $b) {
        return 0;
      }

      return $a > $b ? 1 : -1;
    });

    $i = "INSERT INTO guide (course_id, field_id, guide_inc) VALUES (?, ?, ?);";
    $u = "UPDATE guide SET guide_inc = ? WHERE course_id = ? AND field_id = ?;";
    $d = "DELETE FROM guide WHERE course_id = ? AND field_id = ?;";
    $insert = self::$db->prepare($i);
    $update = self::$db->prepare($u);
    $delete = self::$db->prepare($d);

    foreach ($diff AS $field_id => $guide_inc) {
      // update or delete
      if (isset($get[ $field_id ])) {
        // delete
        if (is_null($guide_inc)) {
          $delete->execute(array($course_id, $field_id));

          // update
        } else {
          $update->execute(array(($guide_inc ? 1 : 0 ), $course_id, $field_id));
        }

        // insert
      } elseif (! is_null($guide_inc)) {
        $args = array($course_id, $field_id, ($guide_inc ? 1 : 0));
        $insert->execute($args);
      }
    }

    $this->one_get( $regulation_id, $course_id );
  }


  /**
   * DELETE
   * /guides/:regulation_id/courses/:course_id
   *
   * Not implemented.
   */
  public function one_delete($regulation_id) {
    return false;
  }


}
