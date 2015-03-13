<?php

$app->group('/teachers', function() use ($app) {
  $app->get('/', 'Route_Teachers:all_get');
});
