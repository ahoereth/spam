<?php

/**
 * ROUTE
 * /regulations
 *
 * Implemented: all_get, one_get
 *
 * Additional: /regulations/#/fields
 *
 * TODO: Move /regulations/#/fields to own route class.
 */
class Route_Regulations extends Route {


  /**
   * GET
   * /regulations
   */
  public function all_get() {
    $result = self::$db->sql_select('regulations', array('invisible' => 0));
    $this->ok($result);
  }


  /**
   * POST
   * /regulations
   *
   * Not implemented.
   */
  public function all_post() {
    return false;
  }


  /**
   * GET
   * /regulations/:regulation_id
   */
  public function one_get($regulation_id) {
    $result = self::$db->sql_select('regulations', array(
      'regulation_id' => $regulation_id
    ));
  }


  /**
   * PUT
   * /regulations/:regulation_id
   *
   * Not implemented.
   */
  public function one_put($regulation_id) {
    return false;
  }


  /**
   * DELETE
   * /regulations/:regulation_id
   *
   * Not implemented.
   */
  public function one_delete($regulation_id) {
    return false;
  }


  /**
   * GET
   * /regulations/:regulation_id/fields
   */
  public function one_fields_get($regulation_id) {
    $params = self::$app->request()->params();

    $join  = "";
    $args[':regulation_id'] = $regulation_id;

    if (! empty($params['student'])) {
      $args[':username'] = md5($params['student']);

      $join = "
        NATURAL LEFT JOIN (
          SELECT * FROM students_in_fields
          WHERE username = :username
        ) AS sf ";
    }

    $stmt = self::$db->prepare("SELECT *
      FROM fields
      NATURAL LEFT JOIN fields_in_regulations
      {$join}
      WHERE regulation_id = :regulation_id
    ");

    $stmt->execute($args);

    $this->ok(self::$db->fetchAllAssoc($stmt));
  }


}
