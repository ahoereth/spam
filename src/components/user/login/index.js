import angular from 'angular';
import ngRoute from 'angular-route';

import loginform from './form';
import routes from '../../app/services/routes';

import template from './login.html';


class UserLoginController {
  static $inject = ['$scope', '$routeParams'];

  constructor($scope, $routeParams) {
    this.params = $routeParams;
  }
}


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/login', {
    template,
    controller: UserLoginController,
    controllerAs: '$ctrl',
    title: 'Login',
  });
}];


/**
 * MODULE: spam.user.login
 * ROUTE: /login
 */
export default angular
  .module('spam.user.login', [ngRoute, routes, loginform])
  .config(routing)
  .name;
