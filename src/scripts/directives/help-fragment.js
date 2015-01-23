(function () {
  'use strict';

  angular
    .module('spam.directives')
    .directive('helpFragment', helpFragmentDirective);


  /* @ngInject */
  function helpFragmentDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      transclude: true,
      templateUrl: 'partials/directives/help-fragment.html',
      link: function(scope, elemt, attrs) {
        scope.slug  = attrs.slug;
        scope.title = attrs.title;
      }
    };
  }
}());
