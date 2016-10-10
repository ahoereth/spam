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

import controller from './CourseListController';
import template from './list.html';
import './list.css';


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/courses', {
    template,
    controller,
    // controllerAs: 'index',
    title: 'Courses',
    reloadOnSearch: false,
  });
}];


/**
 * MODULE: spam.courses.list
 * ROUTE: /courses
 */
export default angular
  .module('spam.courses.list', [
    ngRoute, restangular, tooltips, iif, scroll, infiniteScroll, buttons,
    routes, coursesService, courseFilter, courseSingle, row,
  ])
  .config(routing)
  .name;
