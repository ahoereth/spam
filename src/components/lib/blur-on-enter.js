import angular from 'angular';

/**
 * MODULE: blurOnEnter
 * DIRECTIVE: blurOnEnter
 *
 * Blur an input field on enter-keypress.
 */
export default angular
  .module('blurOnEnter', [])
  .directive('blurOnEnter', blurOnEnterDirective) // TODO: component
  .name;


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
