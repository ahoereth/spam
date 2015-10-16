(function() {
  'use strict';

  /**
   * MODULE: iifFilter
   * FILTER: iif
   *
   * Inline conditionals from http://stackoverflow.com/a/14165488/1447384
   */
  angular
    .module('iifFilter', [])
    .filter('iif', iifFilter);




  /* @ngInject */
  function iifFilter() {
    return function(input, trueValue, falseValue) {
      return input ? trueValue : falseValue;
    };
  }

})();
