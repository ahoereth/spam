<?php
require_once 'routes/courses.php';
require_once 'routes/fields.php';
require_once 'routes/users.php';
require_once 'routes/regulations.php';
require_once 'routes/teachers.php';
require_once 'routes/guide.php';
require_once 'routes/stats.php';
//require_once 'routes/migrate.php';
require_once 'routes/hash.php';

// OPTIONS catchall
$app->options('/(:route*)', function() use ($app) {
  //noop
});

$app->get('/phpinfo', function() use ($app) {
  $app->response->headers->set('Content-Type', 'text/html');
  $app->response->write(phpinfo());
});
