import angular from 'angular';


function instafocusDirective() {
  return {
    restrict: 'A',
    link: function(scope, elem/*, attrs*/) {
      elem[0].focus();
    }
  };
}


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
