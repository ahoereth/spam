import angular from 'angular';

import routes from '../app/services/routes';
import restangular from '../lib/restangular';
import course from '../courses/single';

import template from './guide.html';
import controller from './GuideController';
import './guide.less';


const guideRouting = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/guide', {
    template,
    controller,
    controllerAs: 'guide',
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
  .name;
