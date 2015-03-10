(function () {
  'use strict';

  /**
   * DIRECTIVE: blurOnEnter
   * Blur an input field on enter-keypress.
   */
  angular
    .module('blurOnEnter', [])
    .directive('blurOnEnter', blurOnEnterDirective);


  /* @ngInject */
  function blurOnEnterDirective() {
    return {
      restrict: 'A',
      link: function(scope, elem/*, attrs*/) {
        elem.on('keypress', function($event) {
          if ($event.keyCode === 13) {
            $event.target.blur();
          }
        });
      }
    };
  }
}());
