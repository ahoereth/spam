import angular from 'angular';

import iif from '../lib/iif';
import restangular from '../lib/restangular';
import routes from '../app/services/routes';
import userService from '../user/services/user';
import loginform from '../user/login/form';
import LandingController from './LandingController';

const landingRouting = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/', {
    templateUrl: 'components/landing/landing.html',
    controller: 'LandingController',
    controllerAs: 'landing'
  });

  RoutesProvider.add('/.', {
    redirectTo: '/'
  });

  RoutesProvider.add('*', {
    redirectTo: '/'
  });
}];


/**
 * MODULE: spam.landing
 * ROUTE: /
 */
export default angular
  .module('spam.landing', [restangular, iif, routes, userService, loginform])
  .controller('LandingController', LandingController)
  .config(landingRouting)
  .name;
