import angular from 'angular';


const urlencodeFilter = ['$window', $window => {
  return function(unencoded) {
    return $window.encodeURIComponent(unencoded);
  };
}];


/**
 * MODULE: urlencodeFilter
 * FILTER: urlencode
 */
export default angular
  .module('urlencodeFilter', [])
  .filter('urlencode', urlencodeFilter)
  .name;
