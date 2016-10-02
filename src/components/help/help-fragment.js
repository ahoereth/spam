import angular from 'angular';


/**
 * MODULE: spam.help.fragment
 * DIRECTIVE: helpFragment
 */
export default angular
  .module('spam.help.fragment', [])
  .directive('helpFragment', helpFragmentDirective)
  .name;




/* @ngInject */
function helpFragmentDirective() {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    transclude: true,
    template:
      '<div class="panel panel-default">' +
        '<div class="panel-heading" ng-click="open(slug)">' +
          '<h2 class="panel-title">{{::title}}</h2>' +
        '</div>' +
        '<div class="panel-body" ng-show="opened == slug" ng-transclude>' +
        '</div>' +
      '</div>',
    link: function(scope, elem, attrs) {
      scope.slug  = attrs.slug;
      scope.title = attrs.title;
    }
  };
}
