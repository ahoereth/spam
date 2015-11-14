(function () {
  'use strict';

  /**
   * MODULE: spam.user.index.grade-input
   * DIRECTIVE: gradeInput
   */
  angular
    .module('spam.user.index.grade-input', [
      'blurOnEnter'
    ])
    .directive('gradeInput', gradeInputDirective)
    .controller('GradeInputController', gradeInputController);




  function gradeInputDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'components/user/index/grade-input/user.index.grade-input.html',
      controller: 'GradeInputController',
      controllerAs: 'gradeinput',
      bindToController: {
        change: '&',
        grade: '=',
        disabled: '='
      },
    };
  }




  /* @ngInject */
  function gradeInputController($scope, _) {
    var ctrl = this;

    $scope.$watch('gradeinput.grade', function(n, o) {
      if (n === o || parseFloat(n) === parseFloat(o)) {
        return false;
      }

      ctrl.grade = _.formatGrade(n);
      if (
        (!ctrl.disabled && ctrl.grade) || // Special case for fields.
        (ctrl.disabled && !n && o) // Special case for courses.
      ) {
        ctrl.change({newGrade: ctrl.grade});
      }
    });

    ctrl.grade = _.formatGrade(ctrl.grade);
  }

}());
