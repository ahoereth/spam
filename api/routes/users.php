<?php

$app->group('/users', function() use ($app) {
  $app->get ('/', 'Route_Users:all_get');
  $app->post('/', 'Route_Users:all_post');

  $app->group('/:username', function() use ($app) {
    $app->get(   '/', 'Route_Users:one_get');
    $app->put(   '/', 'Route_Users:one_put');
    $app->delete('/', 'Route_Users:one_delete');

    $app->put('/fields/:field_id', 'Route_Users:field_put');
    $app->put('/regulations/:regulation_id', 'Route_Users:regulation_put');

    $app->group('/courses', function() use ($app) {
      $app->get( '/', 'Route_Users_Courses:all_get');
      $app->post('/', 'Route_Users_Courses:all_post');

      $app->group('/:student_in_course_id', function() use ($app) {
        $app->get(   '/', 'Route_Users_Courses:one_get');
        $app->put(   '/', 'Route_Users_Courses:one_put');
        $app->delete('/', 'Route_Users_Courses:one_delete');
      });
    });

  });

});
