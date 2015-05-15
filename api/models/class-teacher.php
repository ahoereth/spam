<?php

class Teacher extends Model {

  protected static $tablename = 'teachers';

  protected static $pk = 'teacher_id';

  protected static $table = array(
    'teacher_id'  => 'BIGINT UNSIGNED',
    'teacher'     => 'VARCHAR(255) UNIQUE',
    'teacher_url' => 'VARCHAR(255)',
    'username'    => 'VARCHAR(255) UNIQUE',
  );

  protected static $foreign = array(
    'username' => 'User',
  );

  protected static $required = array( 'teacher' );

  protected static $defaults = array();


  /**
   * TODO: Refactor.
   */
  public static function find_id_by_name($data, $insert = false) {
    $url   = empty($data['teacher_url']) ? null : $data['teacher_url'];
    $o3_id = empty($data['o3_id'])       ? null : $data['o3_id'];

    // --------------
    // id
    if (is_int($data)) {
      $id = $data;
    } elseif (! empty($data['teacher_id']) && is_int($data['teacher_id'])) {
      $id = $data['teacher_id'];
    }

    if (! empty($id)) {
      $id = self::$db->sql_select_one('teachers', array(
        'teacher_id' => $id,
      ), 'teacher_id');

      if (! empty($id)) {
        return $id;
      }
    }

    // --------------
    // name
    if (is_string($data)) {
      $name = $data;
    } elseif (! empty($data['teacher']) && is_string($data['teacher'])) {
      $name = $data['teacher'];
    }

    if (empty($name)) { return null; }

    $id = self::$db->sql_select_one('teachers', array(
      'teacher' => $name,
    ), 'teacher_id');

    if (! empty($id)) {
      return $id;
    }

    if ($insert) {
      $args = array(
        'teacher' => $name,
        'teacher_url' => $url,
      );

      self::$db->sql_insert('teachers', $args);
      $id = self::$db->sql_select_one('teachers', $args, 'teacher_id');

      if (! empty($id)) {
        return $id;
      }
    }

    return null;
  }


}
