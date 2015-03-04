(function () {
  'use strict';

  angular
    .module('spam.directives')
    .directive('tickable', tickableDirective);


  /* @ngInject */
  function tickableDirective() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        model: '=ngModel',
        change: '&ngChange'
      },
      templateUrl: 'partials/directives/tickable.html'
    };
  }
}());
