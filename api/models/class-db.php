<?php

/**
 * TODO: Comments.
 */
class DB extends PDO {


  public function sql_select_one($tablename, $selectors, $columns = '*') {
    $result = $this->sql_select($tablename, $selectors, $columns);
    return isset($result[0]) ? $result[0] : null;
  }


  public function sql_select($tablename, $selectors, $columns = '*') {
    $single = is_string($columns) && '*' != $columns ? $columns : false;
    $selects = '*' != $columns ? self::generate_selects((array) $columns) : '*';
    $where   = self::generate_selectors($selectors);
    $values  = array_values(array_filter($selectors, 'self::sql_null'));

    $query = "SELECT {$selects} FROM {$tablename} WHERE {$where};";

    $stmt = $this->prepare($query);
    $stmt->execute($values);
    $rows = self::fetchAllAssoc($stmt);

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


  public function sql_put($tablename, $selectors, $data) {
    if ($this->sql_select_one($tablename, $selectors)) {
      $this->sql_update($tablename, $selectors, $data);
    } else {
      $this->sql_insert($tablename, array_merge($data, $selectors));
    }

    return $this->sql_select_one($tablename, $selectors);
  }


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
  public static function generate_selectors($data = null) {
    if (empty($data)) {
      return false;
    }

    if (is_assoc($data)) {
      $string = '';
      foreach ($data AS $key => $v) {
        $string .= "`{$key}`";
        $v = null === $v ? 'NULL' : $v;
        $string .= 'NULL' === $v || 'NOT NULL' === $v ? ' IS ' . $v : " = ?";
        $string .= ' AND ';
      }

      // cut off last AND
      $string = substr($string, 0, -5);
    } else {
      $string = '`' . implode('`=? AND `', $data) . '`=?';
    }

    return $string;
  }


  protected static function generate_selects($data = array()) {
    if (! is_assoc($data)) {
      return implode(',', $data);
    }

    $selects = '';
    foreach ($data AS $column => $datatype) {
      if ($datatype == 'TIMESTAMP') {
        $column = "UNIX_TIMESTAMP({$column}) AS {$column}";
      }

      $selects .= $column . ',';
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

      // Handle special tinyint(1) / bool cases.
      // See: https://bugs.php.net/bug.php?id=48724
      switch ($name) {
        case 'passed':
        case 'muted':
        case 'preliminary':
        case 'invisible':
        case 'mat_verify':
        case 'one_of_five':
          $assoc[ $name ] = (bool) $assoc[ $name ];
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
  public static function fetchAllAssoc(PDOStatement $stmt) {
    return self::convertTypesAll($stmt, $stmt->fetchAll(PDO::FETCH_ASSOC));
  }


  /**
   * Wrapper for PDO fetch(PDO::FETCH_ASSOC)
   */
  public static function fetchAssoc(PDOStatement $stmt) {
    return self::convertTypes($stmt, $stmt->fetch(PDO::FETCH_ASSOC));
  }


  /**
   * Checks a string for being null or the string null/not null. Used for sql
   * statements.
   *
   * @param  {string} $var
   * @return {bool}
   */
  private static function sql_null($var) {
    return (null !== $var && 'NULL' !== $var && 'NOT NULL' !== $var);
  }


}
