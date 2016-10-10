import angular from 'angular';

import template from './inline-selectable.html';


class InlineSelectableGroupController {
  static $inject = ['$scope'];

  constructor($scope) {
    this.$scope = $scope;
  }

  setValue(value) {
    this.selected = value;
    this.$scope.model = value;
  }
}

const inlineSelectableGroupDirective = () => ({
  restrict: 'E',
  replace: false,
  transclude: false,
  scope: {
    model: '=ngModel',
  },
  controller: InlineSelectableGroupController,
});


const inlineSelectableDirective = () => ({
  template,
  restrict: 'E',
  replace: true,
  transclude: true,
  scope: {
    value: '=',
  },
  require: '^^inlineSelectableGroup',
  link: function inlineSelectableLink(scope, elem, attrs, groupCtrl) {
    scope.$watch(
      () => groupCtrl.selected,
      newVal => { scope.selected = newVal; }
    );

    scope.change = () => {
      groupCtrl.setValue(scope.value);
    };
  },
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
