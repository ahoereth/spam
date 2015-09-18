(function () {
  'use strict';

  angular
    .module('tickable', [])
    .directive('tickable', tickableDirective);


  /* @ngInject */
  function tickableDirective($timeout) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        model: '=ngModel',
        changeTarget: '&ngChange'
      },
      templateUrl: 'partials/directives/tickable.html',
      link: function(scope) {
        // Calling the ngChange function directly in the template resulted in it
        // being called before the value actually changed.
        scope.change = function() {
          var self = this;
          $timeout(function() {
            scope.changeTarget(self);
          }, 0);
        };
      }
    };
  }
}());
