<?php

$server = DB_TYPE . ':host=' . DB_HOST . ';dbname=' . DB_NAME; // ; port=####
$db = new DB($server, DB_USER, DB_PASSWORD, array());
$db->query("SET NAMES 'utf8'");

if (DEBUG) {
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  error_reporting(E_ALL);
  ini_set('display_errors', '1');
}
