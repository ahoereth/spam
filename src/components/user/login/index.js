import angular from 'angular';
import ngRoute from 'angular-route';

import loginform from './form';
import routes from '../../app/services/routes';


class UserLoginController {
  static $inject = ['$scope', '$routeParams'];
  constructor($scope, $routeParams) {
    this.params = $routeParams;
  }
}


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/login', {
    controller: 'UserLoginController',
    controllerAs: 'login',
    templateUrl: 'components/user/login/login.html',
    title: 'Login'
  });
}];



/**
 * MODULE: spam.user.login
 * ROUTE: /login
 * CONTROLLER: UserLoginController
 */
export default angular
  .module('spam.user.login', [ngRoute, routes, loginform])
  .controller('UserLoginController', UserLoginController)
  .config(routing)
  .name;
