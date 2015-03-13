<?php
// This is a sample configuration file. Actual configuration files are
// prefixed config_* and contain the real database authentication keys -
// therefore they are listed in .gitignore.

define('DEBUG', true);
define('LOCAL', true);

define('DB_USER', '');
define('DB_PASSWORD', '');

define('DB_TYPE', 'mysql');
define('DB_HOST', 'localhost');
define('DB_NAME', '');

$server = DB_TYPE . ':host=' . DB_HOST . ';dbname=' . DB_NAME; // ; port=####
$db = new DB($server, DB_USER, DB_PASSWORD, array());
$db->query("SET NAMES 'utf8'");

if (DEBUG) {
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  error_reporting(E_ALL);
  ini_set('display_errors', '1');
}
