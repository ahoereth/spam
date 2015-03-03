(function () {
  'use strict';

  angular
    .module('spam.directives')
    .directive('dropdownCheckbox', dropdownCheckboxDirective);


  /* @ngInject */
  function dropdownCheckboxDirective() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        model: '=ngModel',
        change: '&ngChange'
      },
      templateUrl: 'partials/directives/dropdown-checkbox.html'
    };
  }
}());
