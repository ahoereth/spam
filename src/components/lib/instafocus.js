import angular from 'angular';


const instafocusDirective = () => ({
  restrict: 'A',
  link: (scope, elem) => elem[0].focus(),
});


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
