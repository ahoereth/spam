import angular from 'angular';
import 'restangular';
import _ from 'lodash'; // TODO: refactor

import routes from '../app/services/routes';
import course from '../courses/single';

// import 'guide.less';


/**
 * MODULE: spam.guide
 * CONTROLLER: GuideController
 * ROUTE: /guide
 */
export default angular
  .module('spam.guide', ['restangular', routes, course])
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
    _(guide)
      .groupBy(function(course) {
        return course.year + course.term;
      })
      .forEach(function(course, k) {
        ctrl.courses[k] = _.groupBy(course, 'singleField');
      });
  });
}