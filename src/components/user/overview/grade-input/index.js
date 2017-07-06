import angular from 'angular';

import blurOnEnter from '../../../lib/blur-on-enter';
import userService from '../../services/user';

import controller from './GradeInputController';
import template from './grade-input.html';
import './grade-input.css';

/**
 * MODULE: spam.user.overview.grade-input
 * COMPONENT: gradeInput
 */
export default angular
  .module('spam.user.overview.grade-input', [blurOnEnter, userService])
  .component('gradeInput', {
    template,
    controller,
    bindings: {
      change: '&',
      grade: '<',
      active: '<?',
    },
  }).name;
