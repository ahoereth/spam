(function () {
  'use strict';

  angular
    .module('inlineSelectables', [])
    .directive('inlineSelectableGroup', inlineSelectableGroupDirective)
    .directive('inlineSelectable', inlineSelectableDirective);


  /* @ngInject */
  function inlineSelectableGroupDirective() {
    return {
      restrict: 'E',
      replace: false,
      transclude: false,
      scope: {
        model: '=ngModel'
      },
      /* @ngInject */
      controller: function($scope) {
        var ctrl = this;

        ctrl.setValue = function(value) {
          ctrl.selected = value;
          $scope.model = value;
        };
      }
    };
  }


  /* @ngInject */
  function inlineSelectableDirective() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        value: '='
      },
      require: '^^inlineSelectableGroup',
      templateUrl: 'components/lib/inline-selectables/inline-selectable.html',
      link: function(scope, elem, attrs, groupCtrl) {
        scope.$watch(
          function(){ return groupCtrl.selected; },
          function(newVal){
            scope.selected = newVal;
          }
        );

        scope.change = function() {
          groupCtrl.setValue(scope.value);
        };
      }
    };
  }
}());
