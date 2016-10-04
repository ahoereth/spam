import angular from 'angular';
import ngRoute from 'angular-route';

import iif from '../../lib/iif';
import scroll from '../../lib/scroll';
import infiniteScroll from '../../lib/infinite-scroll';
import buttons from '../../lib/buttons';
import tooltips from '../../lib/tooltips';
import restangular from '../../lib/restangular';
import routes from '../../app/services/routes';
import coursesService from '../services/courses';
import courseFilter from '../filters/course';
import courseSingle from '../single';
import row from '../row';
import CourseListController from './CourseListController';

// import './list.css';


const courseListRouting = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/courses', {
    controller: 'CourseListController',
    //controllerAs: 'index',
    templateUrl: 'components/courses/list/list.html',
    title: 'Courses',
    reloadOnSearch: false
  });
}];


/**
 * MODULE: spam.courses.list
 * CONTROLLER: CourseListController
 * ROUTE: /courses
 */
export default angular
  .module('spam.courses.list', [
    ngRoute, // $routeParams
    restangular,
    tooltips,
    iif,
    scroll,
    infiniteScroll,
    buttons,
    routes,
    coursesService,
    courseFilter,
    courseSingle,
    row
  ])
  .controller('CourseListController', CourseListController)
  .config(courseListRouting)
  .name;
