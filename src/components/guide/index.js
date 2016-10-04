import angular from 'angular';

import routes from '../app/services/routes';
import restangular from '../lib/restangular';
import course from '../courses/single';
import GuideController from './GuideController';

// import 'guide.less';


const guideRouting = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/guide', {
    controller: 'GuideController',
    controllerAs: 'guide',
    templateUrl: 'components/guide/guide.html',
    title: 'Guide',
  });
}];


/**
 * MODULE: spam.guide
 * CONTROLLER: GuideController
 * ROUTE: /guide
 */
export default angular
  .module('spam.guide', [restangular, routes, course])
  .config(guideRouting)
  .controller('GuideController', GuideController)
  .name;
