import angular from 'angular';

import instafocus from '../../../lib/instafocus';
import iif from '../../../lib/iif';
import restangular from '../../../lib/restangular';
import userService from '../../services/user';
import routes from '../../../app/services/routes';
import UserCourseEditController from './UserCourseEditController';


const userCourseEditRouting = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/~/courses/new', {
    controller: 'UserCourseEditController',
    controllerAs: 'edit',
    templateUrl: 'components/user/courses/edit/edit.html',
    title: 'Add unofficial course',
    access: 1
  });

  RoutesProvider.add('/~/courses/edit/:student_in_course_id', {
    controller: 'UserCourseEditController',
    controllerAs: 'edit',
    templateUrl: 'components/user/courses/edit/user.course.edit.html',
    title: 'Edit personal course',
    access: 1
  });

  RoutesProvider.add('/~/courses/edit', {
    redirectTo: '/~/courses/new'
  });
}];


/**
 * MODULE: spam.user.course.edit
 * ROUTES:
 *   /~/courses/new
 *   /~/courses/:course_id (TODO)
 * CONTROLLER: UserCourseEditController
 */
export default angular
  .module('spam.user.course.edit', [
    restangular, instafocus, iif, routes, userService, routes
  ])
  .controller('UserCourseEditController', UserCourseEditController)
  .config(userCourseEditRouting)
  .name;
