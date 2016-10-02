import angular from 'angular';
import { forEach, groupBy } from 'lodash-es';

import routes from '../app/services/routes';
import restangular from '../lib/restangular';
import course from '../courses/single';

// import 'guide.less';


/**
 * MODULE: spam.guide
 * CONTROLLER: GuideController
 * ROUTE: /guide
 */
export default angular
  .module('spam.guide', [restangular, routes, course])
  .config(guideRouting)
  .controller('GuideController', guideController)
  .name;




/* @ngInject */
function guideRouting(RoutesProvider) {
  RoutesProvider.add('/guide', {
    controller: 'GuideController',
    controllerAs: 'guide',
    templateUrl: 'components/guide/guide.html',
    title: 'Guide'
  });
}




/* @ngInject */
function guideController(Restangular) {
  var ctrl = this;
  ctrl.courses = {};
  Restangular.one('guides', 1).getList('courses').then(function(guide) {
    forEach(
      groupBy(guide, function(course) { return course.year + course.term; }),
      function(course, k) { ctrl.courses[k] = groupBy(course, 'singleField'); }
    );
  });
}
