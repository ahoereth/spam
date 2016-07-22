<?php
// Configuration
define('ENV', '');
require_once sprintf('../config/%s.php', ENV);

// Initialize database connection.
$server = DB_TYPE . ':host=' . DB_HOST . ';dbname=' . DB_NAME; // ; port=####
$db = new PDO($server, DB_USER, DB_PASSWORD, array());
$db->query("SET NAMES 'utf8'");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
error_reporting( E_ALL );

// Create tables and insert initial values.
$sql_tables = file_get_contents('tables.sql');
$sql_values = file_get_contents('values.sql');
$db->exec( $sql_tables );
$db->exec( $sql_values );

// Insert demo user.
require_once '../models/class-user.php';
$insert_user = $db->prepare("INSERT INTO users (username, pass, rank, role, special) VALUES (?, ?, ?, ?);");
$insert_user->execute(array(md5('demo'), User::hasher('studyplanning'), 1, 'student', true));
