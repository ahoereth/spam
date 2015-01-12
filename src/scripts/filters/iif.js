(function() {
  'use strict';

  /**
   * FILTER: iif
   *
   * Inline conditionals from http://stackoverflow.com/a/14165488/1447384
   */
  angular
    .module('spam.filters')
    .filter('iif', iifFilter);


  /* @ngInject */
  function iifFilter() {
    return function(input, trueValue, falseValue) {
      return input ? trueValue : falseValue;
    };
  }
})();
