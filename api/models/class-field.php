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
   * Gets a field_id by field_abbr and regulation_abbr.
   *
   * @param string $field_abbr field abbreviation
   * @param string $regulation_abbr regulation abbreviation [optional]
   */
  public static function find_id_by_abbr($field_abbr, $regulation_abbr = null) {
    $args = array($field_abbr);

    if ($regulation_id) {
      $args[] = $regulation_abbr;
      $stmt = $db->prepare("SELECT field_id
        FROM fields NATURAL LEFT JOIN fields_in_regulations
        WHERE field_abbr = ? AND regulation_id = ? LIMIT 1;");
    } else {
      $stmt = $db->prepare("SELECT field_id FROM fields
        WHERE field_abbr = ? LIMIT 1;");
    }

    $stmt->execute($args);

    if (! $stmt->rowCount()) {
      return false;
    }

    $r = self::$db->fetchAllAssoc($stmt);
    return $r['field_id'];
  }


}
