import angular from 'angular';

import blurOnEnter from '../../../lib/blur-on-enter';
import userService from '../../services/user';
import formatGrade from '../../formatGrade';

import './grade-input.css';


/**
 * MODULE: spam.user.overview.grade-input
 * COMPONENT: gradeInput
 */
export default angular
  .module('spam.user.overview.grade-input', [blurOnEnter, userService])
  .controller('GradeInputController', gradeInputController)
  .component('gradeInput', {
    controller: 'GradeInputController',
    templateUrl: 'components/user/overview/grade-input/grade-input.html',
    bindings: {
      change: '&',
      grade: '<',
      editable: '<?'
    }
  })
  .name;




/* @ngInject */
function gradeInputController($scope) {
  var ctrl = this;

  ctrl.changeGrade = function changeGrade(newGrade, oldGrade) {
    if (
      newGrade === oldGrade ||
      parseFloat(newGrade) === parseFloat(oldGrade)
    ) {
      return false;
    }

    ctrl.grade = formatGrade(newGrade);
    if (
      (ctrl.editable && (newGrade || (!newGrade && oldGrade))) || // Special case for fields.
      (!ctrl.editable && !newGrade && oldGrade) // Special case for courses.
    ) {
      ctrl.change({newGrade: ctrl.grade});
    }
  };

  $scope.$watch('$ctrl.grade', ctrl.changeGrade);
  ctrl.grade = formatGrade(ctrl.grade);
}
