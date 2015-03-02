(function () {
  'use strict';

  /**
   * DIRECTIVE: blurOnEnter
   * Blur the grade input field when the user presses the enter key.
   */
  angular
    .module('spam.directives')
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
