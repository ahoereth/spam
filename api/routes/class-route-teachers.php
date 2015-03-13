<?php

/**
 * ROUTE
 * /teachers
 *
 * Implemented: all_get
 */
class Route_Teachers extends Route {


  /**
   * GET
   * /teachers
   */
  public function all_get() {
    $result = self::$db->sql_select('teachers');
    $this->ok($result);
  }


  /**
   * POST
   * /teachers
   *
   * Not implemented.
   *
   * Teachers currently are only created when a course is added with a teacher
   * name who does not yet exist.
   */
  public function all_post() {
    return false;
  }


  /**
   * GET
   * /teachers/:teacher_id
   *
   * Not implemented.
   */
  public function one_get($teacher_id) {
    return false;
  }


  /**
   * PUT
   * /teachers/:teacher_id
   *
   * Not implemented.
   */
  public function one_put($pk) {
    return false;
  }


  /**
   * DELETE
   * /teachers/:teacher_id
   *
   * Not implemented.
   */
  public function one_delete($pk) {
    return false;
  }


}
