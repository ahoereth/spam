import angular from 'angular';

import blurOnEnter from '../../../lib/blur-on-enter';
import userService from '../../services/user';


/**
 * MODULE: spam.user.overview.thesis-input
 * DIRECTIVE: thesisInput
 */
export default angular
  .module('spam.user.overview.thesis-input', [blurOnEnter, userService])
  .controller('ThesisInputController', thesisInputController)
  .component('thesisInput', {
    controller: 'ThesisInputController',
    templateUrl: 'components/user/overview/thesis-input/thesis-input.html'
  })
  .name;




/* @ngInject */
function thesisInputController(User) {
  var ctrl = this;

  // Requires user details.
  if (!User.details) {
    return false;
  }

  ctrl.title = User.details.thesis_title;
  ctrl.grade = User.details.thesis_grade;
  ctrl.styled = !ctrl.title || !ctrl.grade;

  ctrl.blur = function() {
    ctrl.styled = !ctrl.title || !ctrl.grade;

    if (User.details.thesis_title === ctrl.title &&
        User.details.thesis_grade === ctrl.grade
    ) { return; }

    var n = User.updateThesis(ctrl.title, ctrl.grade);
    ctrl.title = n.thesis_title;
    ctrl.grade = n.thesis_grade;
  };

  ctrl.focus = function() {
    ctrl.styled = true;
  };
}
