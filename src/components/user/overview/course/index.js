import angular from 'angular';

import blurOnEnter from '../../../lib/blur-on-enter';
import dropdown from '../../../lib/dropdown';
import tickable from '../../../lib/tickable';
import tooltips from '../../../lib/tooltips';
import icon from '../../../lib/icon';
import userService from '../../services/user';
import field from '../field';
import gradeInput from '../grade-input';

import controller from './CourseController';
import template from './course.html';


/**
 * MODULE: spam.user.overview.course
 * COMPONENT: course
 */
export default angular
  .module('spam.user.overview.course', [
    blurOnEnter, dropdown, tickable, tooltips, userService, field, gradeInput,
    icon,
  ])
  .component('course', {
    template,
    controller,
    require: {
      field: '^^field',
    },
    bindings: {
      course: '=',
    },
  })
  .name;
