<?php
// Loads composer dependencies. See /composer.json for details.
require_once 'lib/autoload.php';

// Initiallize Slim Framework
use Slim\Slim;
$app = new \Slim\Slim();

// Initialize HTTP headers
require_once 'inc/headers.php';

// Initialize class autoloaders.
require_once 'inc/autoload.php';

// GENERAL UTILITIES
require_once 'inc/utils.php';

// DATABASE
$config = 'local';
require_once 'inc/config_' . $config . '.php';

// ROUTING
require_once 'routes/routes.php';

$app->run();
