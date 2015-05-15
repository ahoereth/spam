<?php

$app->group('/courses', function() use ($app) {
  $app->get ('/', 'Route_Courses:all_get');
  $app->post('/', 'Route_Courses:all_post');

  $app->post('/find', 'Route_Courses:find_many');

  $app->group('/:course_id', function() use ($app) {
    $app->get(   '/', 'Route_Courses:one_get');
    $app->put(   '/', 'Route_Courses:one_put');
    $app->delete('/', 'Route_Courses:one_delete');
  });
});
