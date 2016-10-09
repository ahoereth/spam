import angular from 'angular';

import instafocus from '../../../lib/instafocus';
import iif from '../../../lib/iif';
import restangular from '../../../lib/restangular';
import userService from '../../services/user';
import routes from '../../../app/services/routes';

import controller from './UserCourseEditController';
import template from './edit.html';


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/~/courses/new', {
    template,
    controller,
    controllerAs: 'edit',
    title: 'Add unofficial course',
    access: 1,
  });

  RoutesProvider.add('/~/courses/edit/:student_in_course_id', {
    template,
    controller,
    controllerAs: 'edit',
    title: 'Edit personal course',
    access: 1,
  });

  RoutesProvider.add('/~/courses/edit', {
    redirectTo: '/~/courses/new',
  });
}];


/**
 * MODULE: spam.user.course.edit
 * ROUTES:
 *   /~/courses/new
 *   /~/courses/:course_id (TODO)
 */
export default angular
  .module('spam.user.course.edit', [
    restangular, instafocus, iif, routes, userService, routes
  ])
  .config(routing)
  .name;
