import angular from 'angular';


function helpFragmentLink(scope, elem, attrs) {
  scope.slug  = attrs.slug;
  scope.title = attrs.title;
}


function helpFragmentDirective() {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    transclude: true,
    templateUrl: 'components/help/fragment.html',
    link: helpFragmentLink
  };
}


/**
 * MODULE: spam.help.fragment
 * DIRECTIVE: helpFragment
 */
export default angular
  .module('spam.help.fragment', [])
  .directive('helpFragment', helpFragmentDirective)
  .name;
