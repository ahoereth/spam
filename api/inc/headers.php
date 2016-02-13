<?php

$app->response->headers->set('Content-Type', 'application/json');
$app->response->headers->set('charset', 'utf8');

// Security headers
$app->response->headers->set('charset', 'utf8');
$app->response->headers->set('X-Frame-Options', 'SAMEORIGIN');
$app->response->headers->set('X-Content-Type-Options', 'nosniff');
$app->response->headers->set('Content-Security-Policy', "default-src 'self'");
$app->response->headers->set('Strict-Transport-Security', 'max-age=31536000');
$app->response->headers->set('X-XSS-Protection', '1; mode=block');

// Dev headers
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
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  $app->response->headers->set(
    'Access-Control-Allow-Headers',
    'Accept, X-Requested-With, Authorization, Content-Type'
  );
}
