<?php


class Route_Stats extends Route {

  /**
   * GET
   * /stats
   */
  public function all_get() {
    $result = array(
      'user_count' => round(self::$db->sql_select_one(
        'users', array(),
        'count(username)'
      ) - 5, -1),
      /*'user_active_count' => round(self::$db->sql_select_one(
        'users',
        array('last_login>' => date('Y-m-d H:i:s', strtotime('-1 month'))),
        'count(username)'
      ), -1),*/
      'course_count' => self::$db->sql_select_one(
        'courses', array(),
        'count(course_id)'
      ),
      'teacher_count' => round(self::$db->sql_select_one(
        'teachers', array(),
        'count(teacher_id)'
      ), -1),
      'enrollment_count' => round(self::$db->sql_select_one(
        'students_in_courses', array(),
        'count(student_in_course_id)'
      ), -2)
    );

    $this->ok($result);
  }


  /**
   * POST
   * /stats
   *
   * Not implemented.
   */
  public function all_post() {
    return false;
  }


  /**
   * GET
   * /stats/:pk
   *
   * Not implemented.
   */
  public function one_get($pk) {
    return false;
  }


  /**
   * PUT
   * /stats/:pk
   *
   * Not implemented.
   */
  public function one_put($pk) {
    return false;
  }


  /**
   * DELETE
   * /stats/:pk
   *
   * Not implemented.
   */
  public function one_delete($pk) {
    return false;
  }

}
