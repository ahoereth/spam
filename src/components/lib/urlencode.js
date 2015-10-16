(function() {
  'use strict';

  /**
   * MODULE: urlencodeFilter
   * FILTER: urlencode
   */
  angular
    .module('urlencodeFilter', [])
    .filter('urlencode', urlencodeFilter);




  /* @ngInject */
  function urlencodeFilter($window) {
    return function(unencoded) {
      return $window.encodeURIComponent(unencoded);
    };
  }

})();
