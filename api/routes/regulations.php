<?php

$app->group('/regulations', function() use ($app) {
  $app->get( '/', 'Route_Regulations:all_get');
  $app->post('/', 'Route_Regulations:all_post');

  $app->group('/:regulation_id', function() use ($app) {
    $app->get(   '/', 'Route_Regulations:one_get');
    $app->put(   '/', 'Route_Regulations:one_put');
    $app->delete('/', 'Route_Regulations:one_delete');

    $app->get('/fields', 'Route_Regulations:one_fields_get');
  });
});
