<?php

$app->response->headers->set('Content-Type', 'application/json');
$app->response->headers->set('charset', 'utf8');

$app->response->headers->set('Access-Control-Allow-Origin', '*');
$app->response->headers->set('Access-Control-Allow-Credentials', 'true');
$app->response->headers->set(
  'Access-Control-Allow-Methods',
  'GET, POST, PUT, DELETE'
);
$app->response->headers->set(
  'Access-Control-Allow-Headers',
  'Accept, X-Requested-With, Authorization, Content-Type'
);
