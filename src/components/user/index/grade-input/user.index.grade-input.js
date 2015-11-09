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
    var oldGrade;

    ctrl.blur = function(grade) {
      ctrl.grade = _.formatGrade(grade);

      if (ctrl.grade !== oldGrade) {
        oldGrade = ctrl.grade;
        ctrl.change({newGrade: ctrl.grade});
      }
    };

    ctrl.grade = oldGrade = _.formatGrade(ctrl.grade);
  }

}());
