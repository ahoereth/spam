<?php
require_once 'routes/courses.php';
require_once 'routes/fields.php';
require_once 'routes/users.php';
require_once 'routes/regulations.php';
require_once 'routes/teachers.php';
require_once 'routes/guide.php';
//require_once 'routes/migrate.php';
require_once 'routes/hash.php';


// xkcd api root
$app->get('/', function() use ($app) {
  $xkcd = '<title>SPAM API</title>
           <img src="http://imgs.xkcd.com/comics/mac_pc.png" title="xkcd#939">';
  $app->response->headers->set('Content-Type', 'text/html');
  $app->response->write($xkcd);
});


$app->get('/phpinfo', function() use ($app) {
  $app->response->headers->set('Content-Type', 'text/html');
  $app->response->write(phpinfo());
});

// Options catchall
$app->options('/(:name+)', function() use ($app) {
  //noop
});
