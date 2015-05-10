<?php

class Field extends Model {

  protected static $tablename = 'fields';

  protected static $pk = 'field_id';

  protected static $table = array(
    'field_id'                   => 'BIGINT UNSIGNED',
    'field_abbr'                 => 'VARCHAR(4)',
    'field'                      => 'VARCHAR(255)',
    'field_desc'                 => 'TEXT',
    'field_examination_possible' => 'BOOLEAN',
  );

  protected static $required = array(
    'abbr',
    'field'
  );

  protected static $defaults = array();


  /**
   * Gets a field_id by field_abbr and regulation_id.
   *
   * @param {string} $field_abbr    field abbreviation
   * @param {string} $regulation_id regulation abbreviation [optional]
   */
  public static function find_id_by_abbr($field_abbr, $regulation_id = null) {
    $table = array('fields');
    $selector = array('field_abbr' => $field_abbr);

    if ($regulation_id) {
      $table[] = 'fields_in_regulations';
      $selector['regulation_id'] => $regulation_id;
    }

    return self::$db->sql_select_one(
      $table,
      $selector,
      'field_id'
    );
  }


}
