import angular from 'angular';

/**
 * MODULE: instafocus
 * DIRECTIVE: instafocus
 *
 * Focuses the element on page load.
 */
export default angular
  .module('instafocus', [])
  .directive('instafocus', instafocusDirective)
  .name;


/* @ngInject */
function instafocusDirective() {
  return {
    restrict: 'A',
    link: function(scope, elem/*, attrs*/) {
      elem[0].focus();
    }
  };
}
