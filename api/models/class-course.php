<?php

class Course extends Model {

  protected static $tablename = 'courses';

  protected static $pk = 'course_id';

  protected static $table = array(
    'course_id'        => 'BIGINT UNSIGNED',
    'code'             => 'VARCHAR(255)', // course number, e.g. 8.3124
    'course'           => 'VARCHAR(255)', // course title
    'ects'             => 'SMALLINT DEFAULT 0',
    'type'             => 'VARCHAR(2)', // L/S/K/P for lecture or seminar
    'language'         => 'VARCHAR(3)', // EN/DE
    'term'             => 'CHAR(1)', // W/S for winter or summer term
    'year'             => 'SMALLINT',
    'semester'         => 'SMALLINT',
    'hours'            => 'SMALLINT', // hours/week
    'course_desc'      => 'TEXT',
    'course_notice'    => 'TEXT',
    'course_url'       => 'TEXT',
    'studip_url'       => 'TEXT,',
    'preliminary'      => 'BOOLEAN',
    'added'            => 'TIMESTAMP',
    'modified'         => 'TIMESTAMP',
    'modified_by'      => 'VARCHAR(255)',
    'parent_course_id' => 'BIGINT UNSIGNED',
  );

  protected static $foreign = array(
    'modified_by'      => 'User',
    'parent_course_id' => 'Course',
  );

  protected static $required = array(
    'course',
    'year',
    'term',
  );

  protected static $defaults = array(
    'language'    => 'EN',
    'term'        => 'W',
    'year'        => '%YEAR%',
    'preliminary' => 'f',
    'added'       => '%TIME%',
    'modified'    => '%TIME%',
  );


  /**
   * Makes this instance a child of its self. So the current course_id
   * is moved to parent_course_id.
   */
  public function make_child() {
    if (! empty( $this->data['course_id'] ) && $this->data['course_id']) {
      $this->data['parent_course_id'] = $this->data['course_id'];
      unset( $this->data['course_id'] );
    }
  }


  /**
   * Returns parent_course_id if available, otherwise false.
   *
   * @return {int/boolean} $parent_course_id/false
   */
  public function get_parent_course_id() {
    return ! empty($this->data['parent_course_id']) ?
      $this->data['parent_course_id'] : false;
  }


  /**
   * Either updates the course in the database (if course_id is set) or
   * inserts a new course to the db.
   *
   * @overwrite
   * @param  {assoc} $data Optional new data.
   * @return {bool} success/failure
   */
  public function save($data = array()) {
    $this->set_data($data);

    //studip.serv.uni-osnabrueck.de/details.php?sem_id=32numbersorletters
    $pattern =
      "/studip.serv.(?:uni-osnabrueck|uos).de\/details.php.*sem_id=(\S{32})/";
    if (! empty($this->data['studip_url'])
       && preg_match($pattern, $this->data['studip_url'], $match)
    ) {
      $this->data['studip_url'] =
        "https://studip.serv.uos.de/details.php?sem_id=" . $match[1];
    } else {
      $this->data['studip_url'] = null;
    }

    return parent::save();
  }


  /**
   * Courses might be part of a group, this method tries to guess the group of
   * the current instance from the course name.
   *
   * @return {string}
   */
  public function determine_course_group() {
    $types = array(
      'Lecture',
      'Vorlesung',
      'Practice',
      'Tutorial',
      '.bung',
    );

    $pattern = sprintf('/^(.+)(?:\s\((?:%s)\))$/iU', implode($types, '|'));

    $manual = array(
      'Computergestützte Datenanalyse I' => 'Statistik I',
      'Statistik I'                      => 'Statistik I',
      'Statistik und Datenanalyse I'     => 'Statistik I',
    );

    $matches = array();

    $group = null;
    if (! empty($manual[ $this->data['course'] ])) {
      $group = $manual[ $this->data['course'] ];
    } elseif (preg_match($pattern, $this->data['course'], $matches)) {
      $group = $matches[1];
    }

    return $this->data['course_group'] = $group;
  }


  /**
   * Wraps the aggregate_course function for use with multiple
   * courses which are available in a PDO results object.
   *
   * @param  {PDOStatement} $stmt
   * @param  {int}          $regulation_id
   * @return {array} Array of aggregated courses.
   */
  public static function aggregate_courses($stmt, $regulation_id = null) {
    $courses = array();
    $course  = array();
    $id = 0;

    while ($c = self::$db->fetchAssoc($stmt)) {
      $idkey = ! empty($c['student_in_course_id']) ?
        'student_in_course_id' : 'course_id';

      // If id changed a new course is going to be aggregated.
      if (0 !== $id && $c[$idkey] !== $id) {
        $courses[] = $course; // Add last course to stack.
        $course = array(); // Start new course.
      }

      // Remember the id for the next iteration.
      $id = $c[$idkey];

      // Aggregate.
      $course = self::aggregate_course($course, $c, $regulation_id);
    }

    // Put the last course from the aggregation on the stack.
    if (! empty($course)) {
      $courses[] = $course;
    }

    return $courses;
  }


  /**
   * Aggregates the course information given in the second parameter in a set
   * of course information in the first parameter. This function is meant
   * to be called repeatedly for multiple sets of course info which has the
   * same id.
   *
   * This function got necessary because older mysql/postgresql versions do
   * not ship with any JSON capabilities.
   *
   * TODO: Refactor. Cyclomatic complexity to high. Aaand.. this is a mess.
   *
   * @param {array} $course existing course which might already contain
   *                        plenty of aggregated data.
   * @param {array} $c      course info which should be merged into $course
   * @param {int}   $regulation_id
   */
  public static function aggregate_course($course, $c, $regulation_id = null) {
    // Initial aggregation run - copy over standard information.
    if (empty($course)) {
      $course = array_pick($c, array(
        'course_id',
        'hours',
        'course',
        'ects',
        'term',
        'year',
        'code',
        'type',
        'course_in_field_type',
        'enrolled_field_id',
        'enrolled',
        'enrolled_course_in_field_type',
        'student_in_course_id',
        'passed',
        'muted',
        'grade',
        'preliminary',
      ));
    }

    // Add teacher to course if not aggregated already.
    if (! empty($c['teacher_id'])) {
      $teacher = array_pick($c, array(
        'teacher_id',
        'teacher'
      ));

      if (! isset($course['teachers']) || -1 === ($index =
        array_2d_search($course['teachers'], 'teacher_id', $c['teacher_id']))
      ) {
        $course['teachers'][] = $teacher;
        $course['teachers_str'] = ! empty($course['teachers_str']) ?
          $course['teachers_str'] . ', ' . $teacher['teacher'] :
          $teacher['teacher'];
      }
    }


    // If course has no regulation or no specific regulation is requested or
    // if the course has the specified regulation...
    if (empty($c['regulation_id']) ||
        (empty($regulation_id) || $regulation_id == $c['regulation_id'])
    ) {
      // Add field to course if not aggregated already.
      $field = null;
      if (! empty($c['field_id'])) {
        $field = array_pick($c, array(
          'field',
          'field_id',
          'course_in_field_type',
        ));

        // Add regulation to field if required.
        if (! empty($c['regulation_id'])) {
          $field['regulations'] = array(array_pick($c, array(
            'regulation_id',
            'regulation',
            'regulation_abbr'
          )));
        }
      }

      // Add field if not added already.
      if (! isset($course['fields']) || -1 === ($index =
        array_2d_search($course['fields'], 'field_id', $c['field_id']))
      ) {
        if (! empty($field)) {
          $field_str = $field['field'] .
            (isset($field['course_in_field_type']) &&
             $field['course_in_field_type'] == 'PM' ? ' (PM)' : '');

          $course['fields'][] = $field;
          $course['fields_str'] = ! empty($course['fields_str']) ?
            $course['fields_str'] . ", $field_str" :
            $field_str;
        }
      } elseif (! empty($field['regulations']) &&
        (! in_array(
          $field['regulations'][0],
          $course['fields'][$index]['regulations']
        ))
      ) {
        $course['fields'][$index]['regulations'][] = $field['regulations'][0];
      }
    }

    // Does the course only have one possible field?
    if (empty($course['fields'])) {
      $course['singleField'] = 'null'; // 'no field' --> open studies
    } elseif (count($course['fields']) == 1) {
      $course['singleField'] = (int) $course['fields'][0]['field_id'];
    } else {
      $course['singleField'] = false;
    }

    return $course;
  }


}
