import angular from 'angular';


function iifFilter() {
  return (input, trueValue, falseValue) => (input ? trueValue : falseValue);
}


/**
 * MODULE: iifFilter
 * FILTER: iif
 *
 * Inline conditionals from http://stackoverflow.com/a/14165488/1447384
 */
export default angular
  .module('iifFilter', [])
  .filter('iif', iifFilter)
  .name;
