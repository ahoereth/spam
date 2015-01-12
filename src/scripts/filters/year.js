(function() {
  'use strict';

  /**
   * FILTER: year
   *
   * Converts a given 4 digit year to it's 2 digit equivalent.
   */
  angular
    .module('spam.filters')
    .filter('year', yearFilter);


  /* @ngInject */
  function yearFilter() {
    return function(year) {
      return ('0' + year % 100).slice(-2);
    };
  }
})();
