(function () {
  'use strict';

  /**
   * MODULE: instafocus
   * DIRECTIVE: instafocus
   *
   * Focuses the element on page load.
   */
  angular
    .module('instafocus', [])
    .directive('instafocus', instafocusDirective);


  /* @ngInject */
  function instafocusDirective() {
    return {
      restrict: 'A',
      link: function(scope, elem/*, attrs*/) {
        elem[0].focus();
      }
    };
  }

}());
