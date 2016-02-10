<?php

$app->response->headers->set('Content-Type', 'application/json');
$app->response->headers->set('charset', 'utf8');

if (DEV) {
  $allow = '*';
  $origin = $app->request->headers->get('Origin');
  if (!$app->request->isOptions() && !empty($origin)) {
    $allow = $origin;
  }

  $app->response->headers->set('Access-Control-Allow-Origin', $allow);
  $app->response->headers->set('Access-Control-Allow-Credentials', 'true');
  $app->response->headers->set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE', 'OPTIONS'
  );
  $app->response->headers->set(
    'Access-Control-Allow-Headers',
    'Accept, X-Requested-With, Authorization, Content-Type'
  );
}
