(function () {
  'use strict';

  /**
   * MODULE: spam.components.help.fragment
   * DIRECTIVE: helpFragment
   */
  angular
    .module('spam.components.help.fragment', [])
    .directive('helpFragment', helpFragmentDirective);


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
}());
