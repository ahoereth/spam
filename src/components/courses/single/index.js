import angular from 'angular';
import ngRoute from 'angular-route';

import urlencode from '../../lib/urlencode';
import restangular from '../../lib/restangular';
import routes from '../../app/services/routes';
import userService from '../../user/services/user';
import CourseController from './CourseController';


const courseRouting = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/courses/:courseId', {
    controller: 'CoursesSingleController',
    //controllerAs: 'course',
    templateUrl: 'components/courses/single/single.html',
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
  .config(courseRouting)
  .controller('CourseController', CourseController)
  .name;
