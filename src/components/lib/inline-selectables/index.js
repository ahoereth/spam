import angular from 'angular';

import template from './inline-selectable.html';


const inlineSelectableGroupDirective = () => ({
  restrict: 'E',
  replace: false,
  transclude: false,
  scope: {
    model: '=ngModel'
  },
  controller: ['$scope', function($scope) {
    this.setValue = (value) => {
      this.selected = value;
      $scope.model = value;
    };
  }]
});


const inlineSelectableDirective = () => ({
  template,
  restrict: 'E',
  replace: true,
  transclude: true,
  scope: {
    value: '='
  },
  require: '^^inlineSelectableGroup',
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
});


/**
 * MODULE: inlineSelectables
 * DIRECTIVES:
 *   inlineSelectableGroup
 *   inlineSelectable
 */
export default angular
  .module('inlineSelectables', [])
  .directive('inlineSelectableGroup', inlineSelectableGroupDirective)
  .directive('inlineSelectable', inlineSelectableDirective)
  .name;
