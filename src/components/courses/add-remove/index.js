import angular from 'angular';

import userService from '../../user/services/user';
import AddRemoveCourseController from './AddRemoveCourseController';


const addRemoveCourseComponent = {
  bindings: {
    course: '<course',
    btnClass: '@'
  },
  templateUrl: 'components/courses/add-remove/add-remove.html',
  controller: 'AddRemoveCourseController',
};


/**
 * MODULE: spam.courses.add-remove
 * DIRECTIVE: addRemoveCourse
 */
export default angular
  .module('spam.courses.add-remove', [userService])
  .controller('AddRemoveCourseController', AddRemoveCourseController)
  .component('addRemoveCourse', addRemoveCourseComponent)
  .name;
