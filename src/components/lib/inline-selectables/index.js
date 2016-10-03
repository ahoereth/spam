import angular from 'angular';


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




/* @ngInject */
function inlineSelectableGroupDirective() {
  return {
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
  };
}




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
