<?php

$app->response->headers->set('Content-Type', 'application/json');
$app->response->headers->set('charset', 'utf8');

// Handle CORS requests. When performing a CORS request only specific users
// are allowed to access restricted parts of the API - see User::authorize()
$remote = $app->request->headers->get('ORIGIN');
$isremote = $remote &&
            -1 === strpos($app->request->headers->get('host'), $remote);
define('REMOTE', $isremote);
if ($isremote) {
  $app->response->headers->set('Access-Control-Allow-Origin', $remote);
  $app->response->headers->set('Access-Control-Allow-Credentials', 'true');
  $app->response->headers->set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE'
  );
  $app->response->headers->set(
    'Access-Control-Allow-Headers',
    'Accept, X-Requested-With, Authorization, Content-Type'
  );
}
