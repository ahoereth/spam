(function () {
  'use strict';

  /**
   * MODULE: spam.user.index.grade-input
   * COMPONENT: gradeInput
   */
  angular
    .module('spam.user.index.grade-input', [
      'blurOnEnter'
    ])
    .controller('GradeInputController', gradeInputController)
    .component('gradeInput', {
      controller: 'GradeInputController',
      templateUrl: 'components/user/index/grade-input/user.index.grade-input.html',
      bindings: {
        change: '&',
        grade: '<',
        editable: '<?'
      }
    });




  /* @ngInject */
  function gradeInputController($scope, _) {
    var ctrl = this;

    ctrl.changeGrade = function changeGrade(newGrade, oldGrade) {
      if (
        newGrade === oldGrade ||
        parseFloat(newGrade) === parseFloat(oldGrade)
      ) {
        return false;
      }

      ctrl.grade = _.formatGrade(newGrade);
      if (
        (ctrl.editable && (newGrade || (!newGrade && oldGrade))) || // Special case for fields.
        (!ctrl.editable && !newGrade && oldGrade) // Special case for courses.
      ) {
        ctrl.change({newGrade: ctrl.grade});
      }
    };

    $scope.$watch('$ctrl.grade', ctrl.changeGrade);
    ctrl.grade = _.formatGrade(ctrl.grade);
  }

}());
