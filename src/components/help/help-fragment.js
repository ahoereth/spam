import angular from 'angular';

import template from './help-fragment.html';

function helpFragmentLink(scope, elem, attrs) {
  scope.slug = attrs.slug;
  scope.title = attrs.title;
}


const helpFragmentDirective = () => ({
  template,
  restrict: 'E',
  replace: true,
  scope: true,
  transclude: true,
  link: helpFragmentLink,
});


/**
 * MODULE: spam.help.fragment
 * DIRECTIVE: helpFragment
 */
export default angular
  .module('spam.help.fragment', [])
  .directive('helpFragment', helpFragmentDirective)
  .name;
