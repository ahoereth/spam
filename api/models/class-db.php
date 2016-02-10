<?php

class DB extends PDO {


  /**
   * Select a single row or a single value (depending on the $columns argument)
   * from the database. Wraps the sql_select() method.
   *
   * @param  {array/string} $tablename Array of tables to be joined
   *                                   (NATURAL LEFT) or single table name
   *                                   as string.
   * @param  {assoc}        $selectors Object of column/value pairs for the
   *                                   WHERE clause.
   * @param  {array/string} $columns   Array of columns to select, a asterisk
   *                                   as string to select all columns or a
   *                                   column name as string to select a single
   *                                   value and return it as string/number.
   * @return {assoc/string} Result object of column/value pairs or single
   *                        result value as string/number.
   */
  public function sql_select_one($tablename, $selectors, $columns = '*') {
    $result = $this->sql_select($tablename, $selectors, $columns);
    return isset($result[0]) ? $result[0] : null;
  }


  /**
   * Select rows or a single column (depending on the $columns argument)
   * from the database.
   *
   * @param  {array/string} $tablename Array of tables to be joined
   *                                   (NATURAL LEFT) or single table name
   *                                   as string.
   * @param  {assoc}        $selectors Object of column/value pairs for the
   *                                   WHERE clause.
   * @param  {array/string} $columns   Array of columns to select, a asterisk
   *                                   as string to select all columns or a
   *                                   column name as string to select a single
   *                                   column and return it as ENUMERATED
   *                                   array.
   * @param  {assoc}        $options
   * @return {array}       Array of column/value pair objects or of
   *                       string/number values.
   */
  public function sql_select(
    $tablename,
    $selectors,
    $columns = '*',
    $options = array()
  ) {
    if (empty($selectors)) { return null; }

    $single = is_string($columns) && '*' != $columns ? $columns : false;
    $selects = '*' != $columns ? self::generate_selects((array) $columns) : '*';
    $where   = self::generate_selectors($selectors, true);
    $values  = array_values(array_filter($selectors, 'self::sql_null'));
    $tablename = implode((array) $tablename, ' NATURAL LEFT JOIN ');


    $query = "SELECT {$selects} FROM {$tablename} {$where};";
    $stmt = $this->prepare($query);
    $stmt->execute($values);

    if (!empty($options['style'])) {
      $rows = self::fetchAllAssoc($stmt, $options['style']);
    } else {
      $rows = self::fetchAllAssoc($stmt);
    }

    if ($single) {
      $result = array();
      foreach ($rows AS $row) {
        $result[] = $row[$single];
      }
    } else {
      $result = $rows;
    }

    return $result;
  }


  /**
   * Wrapper for sql_update and sql_insert. Basically implements 'upsert'.
   *
   * @todo Should probably use 'ON DUPLICATE UPDATE' instead.
   * @see http://dev.mysql.com/doc/refman/5.6/en/insert-on-duplicate.html
   *
   * @param  {string} $tablename [description]
   * @param  {assoc}  $selectors Selector to detect a possible duplicate.
   * @param  {assoc}  $data      Data to update if a duplicate is detected; if
   *                             no duplicate is detected $selectors and $data
   *                             will be merged for a fresh insert.
   * @return {assoc}             Inserted/updated database entry.
   */
  public function sql_put($tablename, $selectors, $data) {
    if (1 === count($this->sql_select($tablename, $selectors))) {
      $this->sql_update($tablename, $selectors, $data);
    } else {
      $this->sql_insert($tablename, array_merge($data, $selectors));
    }

    return $this->sql_select_one($tablename, array_merge($data, $selectors));
  }


  /**
   * Inserts a new row into the specified database table.
   *
   * @param  {string} $tablename Target table.
   * @param  {assoc}  $data      Data object in column/value pairs.
   * @return {bool}   True/false on success/failure.
   */
  public function sql_insert($tablename, $data) {
    if (empty($data)) {
      return false;
    }

    $placeholders = rtrim(str_repeat('?,', count($data)), ',');
    $columns = implode(',', array_keys($data));

    $q = "INSERT INTO {$tablename} ({$columns}) VALUES ({$placeholders});";
    $stmt = $this->prepare($q);

    return $stmt->execute(array_values($data));
  }


  /**
   * Update a existing row in the specified database table.
   *
   * @param  {string} $tablename
   * @param  {assoc}  $selectors
   * @param  {assoc}  $data
   * @return {bool}
   */
  public function sql_update($tablename, $selectors, $data) {
    if (empty($data) || empty($selectors)) {
      return false;
    }

    $set    = self::generate_setters($data);
    $where  = self::generate_selectors($selectors);
    $values = array_merge(
      array_values($data),
      array_values($selectors)
    );

    $query = "UPDATE {$tablename} SET {$set} WHERE {$where};";
    $stmt = $this->prepare($query);
    return $stmt->execute($values);
  }


  /**
   * Wrapper for the SQL DELETE method.
   *
   * @param  {string} $tablename
   * @param  {assoc}  $selectors
   * @return {bool}
   */
  public function sql_delete($tablename, $selectors) {
    if (empty($selectors)) {
      return false;
    }

    $where  = self::generate_selectors($selectors);
    $values = array_values($selectors);

    $query = "DELETE FROM {$tablename} WHERE {$where};";
    $stmt = $this->prepare($query);
    return $stmt->execute($values);
  }


  /**
   * Generates a string of setter pairs for PDO prepare statements.
   * E.g.: name = ?, age = ?
   *
   * @param  {array}  $data Array of keys. Can also handle associative arrays,
   *                        in this case values will be ignored.
   * @return {string}       Setter pair string for PDO prepare.
   */
  public static function generate_setters($data = null) {
    if (empty($data)) {
      return false;
    }

    $keys = is_assoc($data) ? array_keys($data) : array_values($data);

    $string = '`' . implode('` = ?, `', $keys) . '` = ?';
    return $string;
  }


  /**
   * Generates a string of selector pairs for PDO prepare statements.
   * E.g.: name = ? AND age = ?
   *
   * @param  {array}  $data Array of keys. Can also handle associative arrays
   *                        which is useful for NULL values.
   * @return {string}       Selector pair string for PDO prepare.
   */
  public static function generate_selectors($data = null, $where = false) {
    if (empty($data)) {
      return false;
    }

    if (is_assoc($data)) {
      $string = '';
      foreach ($data AS $key => $value) {
        if (is_bool($value)) {
          if (false === $value) {
            continue;
          } else {
            $value = 'NOT NULL';
          }
        }

        $lastchar = substr($key, -1);
        $value = (null === $value) ? 'NULL' : $value;
        if ('NULL' === $value || 'NOT NULL' === $value) {
          $operator = 'IS';
        } elseif ('>' === $lastchar || '<' === $lastchar) {
          $operator = $lastchar;
          $key = substr($key, 0, -1);
          $value = '?';
        } else {
          $operator = '=';
          $value = '?';
        }

        $string .= "`{$key}` {$operator} {$value} AND ";
      }

      // cut off last AND
      $string = substr($string, 0, -5);
    } else {
      $string = '`' . implode('` = ? AND `', $data) . '` = ?';
    }

    if ($where) {
      return 'WHERE ' . $string;
    }

    return $string;
  }


  /**
   * Generate comma seperated column list for use in SQL SELECT clauses.
   *
   * @param  {array}  $data
   * @return {string}
   */
  protected static function generate_selects($data = array()) {
    if (! is_assoc($data)) {
      return implode(',', $data);
    }

    $selects = '';
    foreach ($data AS $key => $value) {
      if ('TIMESTAMP' === $value) { // value is the datatype
        $selects .= "UNIX_TIMESTAMP({$key}) AS {$key},";
      } else if (is_numeric($key)) { // value is the column name
        $selects .= $value . ',';
      } else { // value specifies a column name translation using 'as'
        $selects .= $key . ' AS ' . $value;
      }
    }

    return rtrim($selects, ',');
  }


  /**
   * Converts columns from strings to types according to
   * PDOStatement::columnMeta
   *
   * Server does not support mysqlnd
   * @see blog.ulf-wendel.de/2008/pdo_mysqlnd-the-new-features-of-pdo_mysql
   *
   * @param {PDOStatement} $statement
   * @param {assoc}        $assoc Returned by PDOStatement::fetch with
   *                              PDO::FETCH_ASSOC.
   * @return {assoc} Copy of $assoc with correct types.
   */
  public static function convertTypes(PDOStatement $statement, $assoc) {
    for ($i = 0; $meta = $statement->getColumnMeta($i); $i++) {
      if (! isset($meta['name']) || ! isset($assoc[ $meta['name'] ])) {
        continue;
      }

      $name = $meta['name'];

      if (isset($meta['native_type'])) {
        switch ($meta['native_type']) {
          case 'TINY':
          case 'SHORT':
          case 'LONG':
          case 'LONGLONG':
          case 'INT24':
            $assoc[ $name ] = (int) $assoc[ $name ];
            break;
          case 'DECIMAL':
          case 'NEWDECIMAL':
            $assoc[ $name ] = (float) $assoc[ $name ];
            break;
          case 'DATETIME':
          case 'DATE':
          case 'TIMESTAMP':
            $assoc[ $name ] = strtotime($assoc[ $name ]);
            break;
          // default: keep as string
        }
      }

      // Handle special tinyint(1) / bool and json string cases.
      // See: https://bugs.php.net/bug.php?id=48724
      switch ($name) {
        case 'passed':
        case 'muted':
        case 'preliminary':
        case 'invisible':
        case 'mat_verify':
        case 'one_of_five':
        case 'field_examination_possible':
        case 'special':
        case 'minimized':
          $assoc[ $name ] = (bool) $assoc[ $name ];
          break;
        case 'overview_order':
        case 'overview_columns':
          // JSON strings to array/assoc. Use `unsanitize` alternativley.
          $assoc[ $name ] = json_decode($assoc[ $name ], true);
          break;
      }
    }

    return $assoc;
  }


  /**
   * Use self::converTypes() on a whole list of results.
   *
   * @param  PDOStatement $stmt
   * @param  {array} $arr
   * @return {array}
   */
  public static function convertTypesAll(PDOStatement $stmt, $arr) {
    foreach ($arr as $key => $row) {
      $arr[ $key ] = self::convertTypes($stmt, $row);
    }

    return $arr;
  }


  /**
   * Wrapper for PDO fetchAll(PDO::FETCH_ASSOC)
   */
  public static function fetchAllAssoc(
    PDOStatement $stmt,
    $style = 'assoc'
  ) {
    switch ($style) {
      case 'groupassoc':
        $rows = $stmt->fetchAll(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);
        return self::convertTypesAll($stmt, array_map('reset', $rows));
        break;
      case 'assoc':
      default:
        return self::convertTypesAll($stmt, $stmt->fetchAll(PDO::FETCH_ASSOC));
    }
  }


  /**
   * Wrapper for PDO fetch(PDO::FETCH_ASSOC)
   */
  public static function fetchAssoc(PDOStatement $stmt) {
    return self::convertTypes($stmt, $stmt->fetch(PDO::FETCH_ASSOC));
  }


  /**
   * Converts arrays/assocs to json strings. Use with `array_map`.
   *
   * @param  {string/number/array/assoc} $var
   * @return {string/number}
   */
  public static function sanitize($var) {
    if (is_array($var)) {
      return json_encode($var);
    }

    return $var;
  }


  /**
   * Converts json strings to arrays/assocs. Use with `array_map`.
   *
   * @param  {string/number} $var
   * @return {string/number/array/assoc}
   */
  public static function unsanitize($var) {
    if (is_json($var)) {
      return json_decode($var, true);
    }

    return $var;
  }


  /**
   * Checks a string for being null or the string null/not null. Used for sql
   * statements.
   *
   * @param  {string} $var
   * @return {bool}
   */
  private static function sql_null($var) {
    return (null !== $var && 'NULL' !== $var && 'NOT NULL' !== $var &&
            !is_bool($var));
  }


}
