import angular from 'angular';


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


/**
 * MODULE: blurOnEnter
 * DIRECTIVE: blurOnEnter
 *
 * Blur an input field on enter-keypress.
 */
export default angular
  .module('blurOnEnter', [])
  .directive('blurOnEnter', blurOnEnterDirective)
  .name;
