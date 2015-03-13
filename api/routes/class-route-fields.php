<?php

/**
 * ROUTE
 * /fields
 *
 * Implemented: all_get, one_get
 */
class Route_Fields extends Route {


  /**
   * GET
   * /fields
   */
  public function all_get() {
    $args = array();
    $where = '';

    if (! empty(self::$params['regulation_id'])) {
      $args[] = self::$params['regulation_id'];
      $where = " AND regulation_id = ?";
    }

    $q = "SELECT *
      FROM              fields
      NATURAL LEFT JOIN fields_in_regulations
      NATURAL LEFT JOIN regulations
      WHERE invisible != 1 $where
      ORDER BY regulation, field;
    ";

    $stmt = self::$db->prepare($q);
    $stmt->execute($args);
    $result = self::$db->fetchAllAssoc($stmt);

    $this->ok($result);
  }


  /**
   * POST
   * /fields
   *
   * Not implemented.
   */
  public function all_post() {
    return false;
  }


  /**
   * GET
   * /fields/:field_id
   */
  public function one_get($field_id) {
    $r = self::$db->sql_select_one('fields', array('field_id' => $field_id));
    $this->ok($r);
  }


  /**
   * PUT
   * /fields/:field_id
   *
   * Not implemented.
   */
  public function one_put($field_id) {
    return false;
  }


  /**
   * DELETE
   * /fields/:field_id
   *
   * Not implemented.
   */
  public function one_delete($field_id) {
    return false;
  }


}
