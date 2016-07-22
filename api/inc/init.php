<?php

$server = sprintf(
  '%s:host=%s;port=%s;dbname=%s',
  DB_TYPE, DB_HOST, DB_PORT, DB_NAME
);
$db = new DB($server, DB_USER, DB_PASSWORD);
$db->query("SET NAMES 'utf8'");

if (DEBUG) {
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  error_reporting(E_ALL);
  ini_set('display_errors', '1');
}
