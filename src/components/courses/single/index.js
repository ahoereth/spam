import angular from 'angular';
import ngRoute from 'angular-route';

import urlencode from '../../lib/urlencode';
import restangular from '../../lib/restangular';
import routes from '../../app/services/routes';
import userService from '../../user/services/user';

import controller from './CourseController';
import template from './single.html';


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/courses/:courseId', {
    template,
    controller,
    //controllerAs: 'course',
    title: ':course',
  });
}];


/**
 * MODULE: spam.courses.single
 * CONTROLLER: CourseController
 * ROUTE: /courses/:course_id
 */
export default angular
  .module('spam.courses.single', [
    ngRoute, restangular, urlencode, routes, userService,
  ])
  .config(routing)
  .name;
