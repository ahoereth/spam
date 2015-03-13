<?php

/**
 * ROUTE
 * /guides
 *
 * Implemented: None.
 *
 * Currently not used. All /guides requests are handled by /guides/#/courses.
 *
 * TODO: Figure out the Route_Guides_Courses and Route_Guides relationship.
 */
class Route_Guides extends Route {


  /**
   * GET
   * /guides
   *
   * Not implemented.
   */
  public function all_get() {
    return false;
  }


  /**
   * POST
   * /guides
   *
   * Not implemented.
   */
  public function all_post() {
    return false;
  }


  /**
   * GET
   * /guides/:regulation_id
   *
   * Not implemented.
   */
  public function one_get($regulation_id) {
    return false;
  }


  /**
   * PUT
   * /guides/:regulation_id
   *
   * Not implemented.
   */
  public function one_put($regulation_id) {
    return false;
  }


  /**
   * DELETE
   * /guides/:regulation_id
   *
   * Not implemented.
   */
  public function one_delete($regulation_id) {
    return false;
  }


}
