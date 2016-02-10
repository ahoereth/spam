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




  /* @ngInject */
  function gradeInputDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        change: '&',
        grade: '=',
        editable: '='
      },
      templateUrl: 'components/user/index/grade-input/user.index.grade-input.html',
      controllerAs: 'gradeinput',
      controller: 'GradeInputController',
      bindToController: true,
      link: function(scope, elem, attr, ctrl) {
        scope.$watch('gradeinput.grade', ctrl.changeGrade);
      }
    };
  }




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

    ctrl.grade = _.formatGrade(ctrl.grade);
  }

}());
