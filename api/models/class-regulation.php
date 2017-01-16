<?php

class Regulation extends Model {

  protected static $tablename = 'regulations';

  protected static $pk = 'regulation_id';

  protected static $table = array(
    'regulation_id'    => 'BIGINT UNSIGNED',
    'regulation_abbr'  => 'VARCHAR(32)',
    'regulation_title' => 'VARCHAR(3)',
    'regulation'       => 'VARCHAR(255)',
    'regulation_desc'  => 'TEXT',
    'examination_fields' => 'TINYINT',
    'invisible'        => 'BOOLEAN',
  );

  protected static $required = array(
    'regulation_abbr',
    'regulation_title',
    'regulation'
  );

  protected static $defaults = array();
}
