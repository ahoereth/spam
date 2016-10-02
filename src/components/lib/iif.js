import angular from 'angular';


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




/* @ngInject */
function iifFilter() {
  return function(input, trueValue, falseValue) {
    return input ? trueValue : falseValue;
  };
}
