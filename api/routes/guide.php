<?php

$app->group('/guides(/:regulation_id)', function() use ($app) {
  $app->get('/', 'Route_Guides_Courses:all_get');

  $app->group('/courses', function() use ($app) {
    $app->get('/', 'Route_Guides_Courses:all_get');

    $app->group('/:course_id', function() use ($app) {
      $app->get(   '/', 'Route_Guides_Courses:one_get');
      $app->put(   '/', 'Route_Guides_Courses:one_put');
      $app->delete('/', 'Route_Guides_Courses:one_delete');
    });
  });
});
