(function() {
  'use strict';

  /**
   * FILTER: urlencode
   */
  angular
    .module('spam.filters')
    .filter('urlencode', urlencodeFilter);


  /* @ngInject */
  function urlencodeFilter($window) {
    return function(unencoded) {
      return $window.encodeURIComponent(unencoded);
    };
  }
})();
