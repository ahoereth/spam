<?php
// This is a sample configuration file. Duplicate it with a secific environment
// as file name and populate the constants below as required. Than change the
// variable at the top of index.php to include the appropriate configuration
// file.

require_once 'inc/utils.php';

define('DEV', getenv_default('DEV', false));
define('DEBUG', getenv_default('DEBUG', false));
define('LOCAL', getenv_default('LOCAL', false));

define('DB_USER', getenv_default('DB_USER', ''));
define('DB_PASSWORD', getenv_default('DB_PASSWORD', ''));

define('DB_TYPE', 'mysql');
define('DB_HOST', getenv_default('DB_HOST', 'localhost'));
define('DB_NAME', getenv_default('DB_NAME', ''));
define('DB_PORT', getenv_default('DB_NAME', ''));
