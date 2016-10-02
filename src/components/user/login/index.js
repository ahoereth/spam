import angular from 'angular';
import ngRoute from 'angular-route';

import loginform from './form';
import routes from '../../app/services/routes';


/**
 * MODULE: spam.user.login
 * ROUTE: /login
 * CONTROLLER: UserLoginController
 */
export default angular
  .module('spam.user.login', [ngRoute, routes, loginform])
  .config(userLoginRouting)
  .controller('UserLoginController', userLoginController)
  .name;




/* @ngInject */
function userLoginRouting(RoutesProvider) {
  RoutesProvider.add('/login', {
    controller: 'UserLoginController',
    controllerAs: 'login',
    templateUrl: 'components/user/login/login.html',
    title: 'Login'
  });
}




/* @ngInject */
function userLoginController(
  $scope,
  $routeParams
) {
  this.params = $routeParams;
}
