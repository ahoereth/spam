<?php

$app->group('/fields', function() use ($app) {
  $app->get( '/', 'Route_Fields:all_get');
  $app->post('/', 'Route_Fields:all_post');

  $app->group('/:field_id', function() use ($app) {
    $app->get(   '/', 'Route_Fields:one_get');
    $app->put(   '/', 'Route_Fields:one_put');
    $app->delete('/', 'Route_Fields:one_delete');
  });
});
