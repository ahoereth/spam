<?php

$app->group('/stats', function() use ($app) {
  $app->get('/', 'Route_Stats:all_get');
});
