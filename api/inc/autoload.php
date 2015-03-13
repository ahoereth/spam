<?php


/**
 * Generator for class paths.
 *
 * @param  {string} $class
 * @param  {string} $type
 * @return {string}
 */
function get_class_path($class, $type) {
  $class = strtolower(str_replace('_', '-', $class));
  return "{$type}s/class-{$class}.php";
}


/**
 * Route class autoloader.
 *
 * @param {string} $class
 */
function include_class_route($class) {
  $class = get_class_path($class, 'route');
  if (file_exists($class)) {
    include $class;
  }
}


/**
 * Model class autoloader.
 *
 * @param {string} $class
 */
function include_class_model($class) {
  $class = get_class_path($class, 'model');
  if (file_exists($class)) {
    include $class;
  }
}


spl_autoload_register('include_class_route', false);
spl_autoload_register('include_class_model', false);
