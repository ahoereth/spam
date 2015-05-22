<?php

/**
 * TODO: Comments.
 */
abstract class Model {

  protected static $db;

  /* protected static $tablename; */

  /* protected static $pk; */

  /* protected static $table; */

  /* protected static $foreign */

  /* protected static $required; */

  /* protected static $defaults; */

  protected $from_server = false;

  protected $parent;

  protected $server_data;

  protected $data = array();

  protected $o3_id;


  public static function init() {
    global $db;
    Model::$db = $db;
  }


  public function __construct($data = array()) {
    $this->set_data($data);

    if (isset($data['o3_id'])) {
      $this->o3_id = $data['o3_id'];
    }
  }


  public function get_data($columns = false) {
    if (! $this->get_pk_value()) {
      return false;
    }

    if (! $this->from_server && ! $this->fetch()) {
      return false;
    }

    $result = $this->data;

    if (! empty($this->parent)) {
      $result = array_merge($this->parent->get_data(), $this->data);
    }

    if (! empty($columns)) {
      return array_pick_pairs($result, $keys);
    }

    return $result;
  }


  public function fetch() {
    if (! $this->get_pk_value()) {
      return false;
    }

    if (! empty($this->parent)) {
      $this->parent->fetch();
    }

    $tablename = static::get_tablename();
    $selector = array();
    $selector[ static::get_pk() ] = $this->get_pk_value();

    $data = self::$db->sql_select_one($tablename, $selector, static::$table);

    if (! $data) {
      return false;
    }

    $this->set_data($data);
    $this->from_server = true;
    $this->server_data = $this->data;
    return $this->data;
  }


  public function save($data = array()) {
    if (! $this->from_server && ! $this->get_pk_value()) {
      return $this->post($data);
    } else {
      return $this->put($data);
    }
  }


  public function post($data = array()) {
    $this->set_data(array_merge(
      static::get_defaults(),
      $this->data,
      $data
    ));

    if (! $this->is_deployable()) {
      return false;
    }

    if (static::has_numeric_pk() && $this->get_pk_value()) {
      return false;
    }

    $tablename = static::get_tablename();

    if (self::$db->sql_insert($tablename, $this->data)) {
      if (static::has_numeric_pk()) {
        $this->set_pk_value(self::$db->lastInsertId(static::get_pk()));
      }

      $this->fetch();
      return true;
    }

    return false;
  }


  public function put($data = array()) {
    $this->set_data(array_merge(
      $this->data,
      $data
    ));

    if (! $this->is_deployable() || ! $this->get_pk_value()) {
      return false;
    }

    $put_data = $this->data;
    if ($this->from_server && ! empty($this->server_data)) {
      $put_data = array_diff_assoc($this->data, $this->server_data);
    }

    // primary key cannot be changed!
    unset($put_data[ static::get_pk() ]);

    $tablename = static::get_tablename();
    $selector  = array();
    $selector[ static::get_pk() ] = $this->get_pk_value();

    if (self::$db->sql_update($tablename, $selector, $put_data)) {
      $this->server_data = $this->data;
      return $from_server = true;
    }

    return false;
  }


  public function delete() {
    if (! $this->from_server && ! $this->get_pk_value()) {
      return false;
    }

    static::remove( $this->get_pk_value() );
  }


  public static function remove($pk_value) {
    $tablename = static::get_tablename();
    $selector = array();
    $selector[ static::get_pk() ] = $pk_value;

    return self::$db->sql_delete($tablename, $selector);
  }


  public function is_deployable() {
    if ($this->get_pk_value() && ! empty($this->data)) {
      return true;
    }

    foreach (static::$required AS $key) {
      if (empty($this->data[$key])) {
        return false;
      }
    }

    return true;
  }


  public function set_data($data) {
    // only accept data which also has a database column
    foreach ($data as $key => $value) {
      if (isset(static::$table[$key])) {
        $this->data[$key] = $value;
      }
    }

    return $this->data;
  }


  public function set($key, $value) {
    if (isset(static::$table[$key])) {
      $this->data[$key] = $value;
    }

    return $this->data;
  }


  public function get_placeholders($data = null) {
    $data = $data || $this->data;

    return rtrim(str_repeat('?,', count($data)), ',');
  }


  public function get_values($data = null) {
    $data = $data || $this->data;
    return array_values($data);
  }


  public function get($key) {
    return isset($this->data[$key]) ? $this->data[$key] : null;
  }


  public function set_pk_value($value) {
    return $this->data[ static::get_pk() ] = $value;
  }


  public function get_pk_value() {
    $pk = static::get_pk();
    $value = ! empty($this->data[$pk]) ? $this->data[$pk] : null;
    return (! empty($value) ? $value : false);
  }


  protected static function has_numeric_pk() {
    static $check = null;

    if ($check == null) {
      $check = ends_with(static::$pk, '_id');
    }

    return $check;
  }


  /**
   * Get the database table name. Either specified or auto generated from the
   * class name.
   *
   * @return {string} table name
   */
  public static function get_tablename() {
    if (empty(static::$tablename)) {
      static::$tablename = strtolower( get_called_class() ) . 's';
    }

    return static::$tablename;
  }


  /**
   * Get the tables primary key column name. Either specified by the model or
   * the first column of the table.
   *
   * @return {string} primary key column name
   */
  public static function get_pk() {
    if (static::$pk) {
      return static::$pk;
    }

    reset(static::$table);
    return static::$pk = key(static::$table);
  }


  /**
   * Gets the specified database column default values. This must be used
   * instead of using the defaults directly because some default values
   * are not initialized due to PHP restrictions.
   *
   * From php.net:
   *   Like any other PHP static variable, static properties may only be
   *   initialized using a literal or constant; expressions are not allowed.
   *   So while you may initialize a static property to an integer or array
   *   (for instance), you may not initialize it to another variable, to a
   *   function return value, or to an object.
   *
   * @see    http://php.net/manual/en/language.oop5.static.php
   * @param  {string} $column column to return
   * @return {string}
   */
  protected static function get_defaults($column = null) {
    static $defaults_parsed;

    if (! $defaults_parsed) {
      foreach (static::$defaults as $key => $value) {
        switch ($value) {
          case '%TIME%':
            static::$defaults[ $key ] = self::current_timestamp('cache');
            break;
          case '%YEAR%':
            static::$defaults[ $key ] = idate('Y');
            break;
          case '%LASTYEAR%':
            static::$defaults[ $key ] = idate('Y') - 1;
            break;
        }
      }

      $defaults_parsed = true;
    }

    if (! empty($column) && isset(static::$defaults[ $column ])) {
      return static::$defaults[ $column ];
    }

    return static::$defaults;
  }


  /**
   * Returns the current mySQL formatted timestamp - ready to for the database.
   *
   * @param  {boolean} $cache If a new timestamp must be generated or a cached
   *                          version is reasonable.
   * @return {string}  mySQL formatted timestamp
   */
  protected static function current_timestamp($cache = false) {
    static $timestamp;

    if ($cache && $timestamp) {
      return $timestamp;
    }

    return $timestamp = date('Y-m-d G:i:s');
  }


  public static function parseData($data) {
    foreach ($data as $key => $value) {
      $data[ $key ] = static::parse($key, $value);
    }

    return $data;
  }


  public static function parse($key, $value) {
    // TODO: return null here?
    if (! isset(static::$table[ $key ])) {
      return $value;
    }

    $key = substr(static::$table[ $key ], 0, 4);
    switch ($key) {
      case 'VARC'://HAR(255)':
      //case 'VARCHAR(32)':
      //case 'VARCHAR(4)':
      case 'CHAR'://(1)':
      case 'TEXT':
        break;

      case 'TINY'://INT':
      case 'SMAL'://LINT':
      case 'INTE'://GER':
      //case 'INTEGER SIGNED':
      //case 'INTEGER UNSIGNED':
      case 'BIGI'://NT':
      //case 'BIGINT SIGNED':
      //case 'BIGINT UNSIGNED':
        $value = intval($value);
        break;

      case 'BOOL'://EAN':
        $value = !! intval($value);
        break;

      case 'TIME'://STAMP':
        break;
    }

    return $value;
  }


}

Model::init();
