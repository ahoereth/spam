import angular from 'angular';

import iif from '../lib/iif';
import restangular from '../lib/restangular';
import routes from '../app/services/routes';
import userService from '../user/services/user';
import loginform from '../user/login/form';

import controller from './LandingController';
import template from './landing.html';


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/', {
    template,
    controller,
    controllerAs: 'landing',
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
  .config(routing)
  .name;
