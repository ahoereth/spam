<?php

class Student extends Model {

  protected static $tablename  = 'students';

  protected static $pk = 'username';

  protected static $table = array(
    'username'      => 'VARCHAR(255)',
    'regulation_id' => 'BIGINT UNSIGNED',
    'firstname'     => 'VARCHAR(255)',
    'lastname'      => 'VARCHAR(255)',
    'mat_term'      => 'CHAR(1)',
    'mat_year'      => 'SMALLINT',
    'mat_verify'    => 'BOOLEAN',
  );

  protected static $foreign = array(
    'username' => 'User',
  );

  protected static $required = array(
    'regulation_id',
  );

  protected static $defaults = array(
    'regulation_id' => 1,
    'mat_year'      => '%LASTYEAR%',
    'mat_term'      => 'W',
  );


  /**
   * @override
   */
  public function __construct($data) {
    parent::__construct($data);

    $data['role'] = 'student';
    $this->parent = new User($data);
  }


  /**
   * @override
   */
  public function save($data = array()) {
    $data = array_merge($this->data, $data);
    $this->set_data($data);

    $this->parent->save($data);

    if (! $this->from_server) {
      $this->post();
    } else {
      $this->put();
    }

    // save new student
    if (! $this->from_server) {
      $tablename = 'students_in_regulations';
      $data = array(
        'username'      => $this->data['username'],
        'regulation_id' => 1,
      );
      self::$db->sql_insert($tablename, $data);
    } else {
      // TODO: update students_in_regulation here
    }
  }


}
