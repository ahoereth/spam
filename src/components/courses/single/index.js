import angular from 'angular';
import ngRoute from 'angular-route';

import urlencode from '../../lib/urlencode';
import restangular from '../../lib/restangular';
import routes from '../../app/services/routes';
import userService from '../../user/services/user';
import controller from './controller';


/**
 * MODULE: spam.courses.single
 * CONTROLLER: CoursesSingleController
 * ROUTE: /courses/:course_id
 */
export default angular
  .module('spam.courses.single', [
    ngRoute, // $routeParams
    restangular,
    urlencode,
    routes,
    userService
  ])
  .config(coursesSingleRouting)
  .controller('CoursesSingleController', controller)
  .name;




/* @ngInject */
function coursesSingleRouting(RoutesProvider) {
  RoutesProvider.add('/courses/:courseId', {
    controller: 'CoursesSingleController',
    //controllerAs: 'course',
    templateUrl: 'components/courses/single/courses.single.html',
    title: ':course'
  });
}
