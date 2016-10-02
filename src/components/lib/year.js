import angular from 'angular';


/**
 * MODULE: yearFilter
 * FILTER: year
 *
 * Converts a given 4 digit year to it's 2 digit equivalent.
 */
export default angular
  .module('yearFilter', [])
  .filter('year', yearFilter)
  .name;




/* @ngInject */
function yearFilter() {
  return function(year) {
    return ('0' + year % 100).slice(-2);
  };
}
