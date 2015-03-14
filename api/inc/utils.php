<?php


/**
 * Checks if an array is an associative array.
 */
function is_assoc($array) {
  return (bool) count(array_filter(array_keys($array), 'is_string'));
}


/**
 * Searches the first level of all associative arrays contained in the passed
 * associative array for the specified key/value pair.
 *
 * @param {assoc}  $haystack
 * @param {string} $key
 * @param {string} $value
 */
function array_2d_search($haystack, $key, $value) {
  if (empty($haystack)) {
    return -1;
  }

  foreach ($haystack AS $index => $subarray) {
    if (isset($subarray[$key]) && $subarray[$key] == $value) {
      return $index;
    }
  }

  return -1;
}


/**
 * Picks all specified keys from the source array.
 *
 * @param  {array} $src
 * @param  {array} $keys
 * @return {array}
 */
function array_pick_pairs($src, $keys) {
  $dst = array();

  foreach ($keys AS $key) {
    if (empty($src[$key])) {
      continue;
    }

    $dst[$key] = $src[$key];
  }

  return $dst;
}


/**
 * Duplicates the given array.
 *
 * @param  {array} $array
 * @return {array}
 */
function array_duplicate($array) {
  return array_merge($array, $array);
}


/**
* Gets the current term.
*
* @param boolean $current if set to false returns the 'not current' term
* @return S / W
*/
function get_current_term($current = true) {
  $m = date('n');
  return ($m > 4 && $m < 10 && $current) ? 'S' : 'W';
}


/**
 * Gets the current term's year.
 *
 * @return {string} S / W
 */
function get_current_term_year() {
  $m = date('n');
  return ($m > 4) ? idate('Y') : idate('Y') - 1;
}


/**
 * Checks if a given string starts with a specific substring.
 *
 * @param  {string} $haystack
 * @param  {string} $needle
 * @return {bool}
 */
function starts_with($haystack, $needle) {
  return $needle === "" || strpos($haystack, $needle) === 0;
}


/**
 * Checks if a given string end with a specific substring.
 *
 * @param  {string} $haystack
 * @param  {string} $needle
 * @return {bool}
 */
function ends_with($haystack, $needle) {
  return $needle === "" || substr($haystack, -strlen($needle)) === $needle;
}


/**
 * Multilevel recursive implode function.
 */
function multi_implode($glue, $array) {
  $result = '';

  foreach ($array as $part) {
    if (is_array($part)) {
      $part = multi_implode($glue, $part);
    }

    $result .= $part . $glue;
  }

  return rtrim($result, $glue);
}


/**
 * Creates an object composed of the picked object properties.
 *
 * @param  {assoc} $assoc
 * @param  {array} $keys
 * @return {assoc}
 */
function array_pick($assoc, $keys) {
  $result = array();
  foreach ($keys AS $key) {
    if (isset($assoc[$key])) {
      $result[$key] = $assoc[$key];
    }
  }

  return $result;
}
