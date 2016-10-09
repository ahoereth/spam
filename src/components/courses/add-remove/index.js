import angular from 'angular';

import userService from '../../user/services/user';

import controller from './AddRemoveCourseController';
import template from './add-remove.html';


/**
 * MODULE: spam.courses.add-remove
 * DIRECTIVE: addRemoveCourse
 */
export default angular
  .module('spam.courses.add-remove', [userService])
  .component('addRemoveCourse', {
    template,
    controller,
    bindings: {
      course: '<course',
      btnClass: '@'
    },
  })
  .name;
