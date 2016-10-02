import angular from 'angular';


/**
 * MODULE: urlencodeFilter
 * FILTER: urlencode
 */
export default angular
  .module('urlencodeFilter', [])
  .filter('urlencode', urlencodeFilter);




/* @ngInject */
function urlencodeFilter($window) {
  return function(unencoded) {
    return $window.encodeURIComponent(unencoded);
  };
}
