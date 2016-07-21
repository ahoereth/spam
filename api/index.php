<?php
// Configuration
define('ENV', 'ikw');
require_once 'inc/config_' . ENV . '.php';

// Loads composer dependencies. See /composer.json for details.
require_once 'lib/autoload.php';

// Initiallize Slim Framework
use Slim\Slim;
$app = new \Slim\Slim();

// Initialize class autoloaders.
require_once 'inc/autoload.php';

// Initialize database connection.
require_once 'inc/init.php';

// Initialize HTTP headers
require_once 'inc/headers.php';

// GENERAL UTILITIES
require_once 'inc/utils.php';

// ROUTING
require_once 'routes/routes.php';

$app->run();
