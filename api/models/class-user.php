<?php

class User extends Model {

  protected static $tablename = 'users';

  protected static $pk = 'username';

  protected static $table = array(
    'username'        => 'VARCHAR(255)',
    'pass'            => 'VARCHAR(255)',
    'rank'            => 'SMALLINT',
    'role'            => 'VARCHAR(32)',
    'accepted_edits'  => 'INTEGER UNSIGNED',
    'dismissed_edits' => 'INTEGER UNSIGNED',
    'request_count'   => 'INTEGER UNSIGNED',
    'uos_ldap'        => 'TIMESTAMP',
    'request_reset'   => 'TIMESTAMP',
    'registered'      => 'TIMESTAMP',
    'last_login'      => 'TIMESTAMP',
    'special'         => 'TINYINT',
  );

  protected static $required = array();

  protected static $defaults  = array(
    'rank'             => 1,
    'uos_ldap'         => '%TIME%',
    'request_reset'    => '%TIME%',
    'registered'       => '%TIME%',
    'last_login'       => '%TIME%',
  );

  public static $authentication_errors = array();

  private $password;


  /**
   * Construct a new user.
   *
   * @overwrite
   * @param {assoc} $data
   */
  public function __construct($data) {
    parent::__construct($data);

    // Database column is 'pass'!
    $this->password = isset($data['password']) ? $data['password'] : null;
  }


  /**
   * The idea is to have a generic constructor which, depending on the type of
   * user, returns the appropriate model: At the moment: User, Student, Teacher.
   *
   * TODO: Currently not in use.
   *
   * @param  {array} $data
   * @return {Model} User/Student/Teacher
   */
  public static function construct($data) {
    $obj       = new self($data);
    $user_data = $obj->get_data();

    if (! empty($user_data['role'])) {
      switch ($user_data['role']) {
        case 'student':
          $obj = new Student($data);
          break;
        case 'teacher':
          // no functionality yet
          break;
      }
    }

    return $obj;
  }


  /**
   * Save to database. Either create or update.
   *
   * @overwrite
   * @param  {assoc} $data
   * @return {bool}  Success/Failure
   */
  public function save($data = array()) {
    if (! empty($data['password'])) {
      $this->password = $data['password'];
    }

    if (! empty($this->password)) {
      $data['pass'] = self::hasher($this->password);
      $this->password = null;
    }

    $this->set_data($data);

    if ($this->from_server) {
      return $this->put();
    } elseif ($this->get_pk_value()) {
      return $this->post();
    }

    return false;
  }


  /**
   * Authorize the user passed with the current request.
   *
   * TODO: Simplify. Cyclomatic complexity of 21.
   *
   * @param  {string} $myname        Only a user with the given username is
   *                                 authorizable.
   * @param  {int}    $required_rank Minimum user rank required for
   *                                 authorization.
   * @return {bool}   Success or failure
   */
  public static function authorize(
    $myname = null,
    $required_rank = null
  ) {
    // Count authentication tries to avoid loops.
    static $int = 0;
    $int++;

    self::$authentication_errors = array(
      'username' => false,
      'password' => false,
      'self' => false,
      'ldap' => false,
      'rank' => false,
      'remote' => false,
    );

    $password = ! empty($_SERVER['PHP_AUTH_PW']) ?
      $_SERVER['PHP_AUTH_PW'] : null;
    $username = ! empty($_SERVER['PHP_AUTH_USER']) ?
      $_SERVER['PHP_AUTH_USER'] : null;
    $userhash = md5($username);


    if (empty($username) || ($myname && $myname != $username)) {
      self::$authentication_errors['username'] = true;
      return false;
    }

    // TODO: Users could also be teachers. User User::construct instead for
    // flexibility.
    $user = new Student(array(
      'username' => $userhash,
    ));

    $data = $user->get_data();

    // Does the user we asked for exist?
    if ($data === false) {
      self::$authentication_errors['username'] = true;

      // Is the password correct?
    } elseif (! self::hasher($password, $data['pass'])) {
      self::$authentication_errors['password'] = true;

      // How old is his ldap verification timestamp? ldap server does not like
      // to many requests, so we need to cache the verification.
    } elseif (! $data['special'] &&
      $data['uos_ldap'] < strtotime('-30 minutes')
    ) {
      self::$authentication_errors['ldap'] = true;
    }

    // When logging in special users like demo accounts or when using the site
    // on a local installation we do not use ldap authentication, just
    // username/password combinations.
    if ($data['special'] || LOCAL) {
      if (self::$authentication_errors['password'] ||
          self::$authentication_errors['username']
      ) {
        return false;
      }

    // Either nonexistent, wrong password or bad ldap.
    } elseif (self::$authentication_errors['username'] ||
              self::$authentication_errors['password'] ||
              self::$authentication_errors['ldap']
    ) {
      // If its not the demo account check ldap again.
      if (('demo' !== $username || 'studyplanning' !== $password) &&
          (! self::ldap($username, $password))
      ) {
        return false;
      }

      // Create user and/or update password.
      $user->save(array(
        'username' => $userhash,
        'password' => $password,
        'uos_ldap' => self::current_timestamp(),
        'special'  => ('demo' === $username),
        'rank'     => ('demo' === $username) ? 1 : 2, // LDAP users have rank 2
      ));

      // Check for loop.
      if ($int > 4) {
        exit; // always
      }

      // We changed some essential stuff, recheck everything to make sure all
      // is good.
      return self::authorize($myname, $required_rank);
    }

    // Update request count and timestamp.
    $user->save(array(
      'request_count' => ++$data['request_count'],
      'last_login' => self::current_timestamp(),
    ));

    // Check rank.
    if (! empty($required_rank) && $data['rank'] < $required_rank) {
      self::$authentication_errors['rank'] = true;
      return false;
    }

    // Remove password and username hash.
    unset($data['pass']);
    $data['username'] = $username;

    return $data;
  }


  /**
   * Verifies a given username/password combination with the UOS ldap servers.
   *
   * @param  string  $username
   * @param  string  $password
   * @return boolean           authenticated yes/no
   */
  private static function ldap($username, $password) {
    $ldapproxy = "ldaps://ldap-01.uos.de ldaps://ldap-02.uos.de";
    $ldapconn = ldap_connect($ldapproxy, 636);

    if (! $ldapconn) {
      // couldn't establish connection, servers might be offline
      return false;
    }

    ldap_set_option($ldapconn, LDAP_OPT_PROTOCOL_VERSION, 3);
    $binddn = sprintf("uid=%s,ou=people,dc=uni-osnabrueck,dc=de", $username);
    $ldapbind = @ldap_bind($ldapconn, $binddn, $password);
    ldap_close($ldapconn);

    return $ldapbind;
  }


  /**
   * Production server runs on PHP Version 5.3.3-7+squeeze21 - therefore we can
   * not rely on either password_ (PHP 5.5+) or password_compat (PHP 5.3.7+).
   *
   * @param  string         $key     key to encrypt/to check
   * @param  boolean        $encdata encrypted key to compare to (optional)
   * @return string/boolean          either true/false or a newly crypted hash
   */
  public static function hasher($key, $encdata = false) {
    $strength = "08";

    $key = urlencode($key);

    // Check cryption.
    if ($encdata) {
      $crypted = crypt($key, '$2a$' . $strength . '$' . substr($encdata, 60));
      return substr($encdata, 0, 60) == $crypted;

      // New cryption.
    } else {
      // Make a salt and hash it with input and add salt to the end.
      $salt = "";
      for ($i = 0; $i < 22; $i++) {
        $salt .= substr(
          './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
          mt_rand(0, 63),
          1
        );
      }

      // Return 82 char string (60 char hash & 22 char salt).
      return crypt($key, '$2a$' . $strength . '$' . $salt) . $salt;
    }
  }


}
