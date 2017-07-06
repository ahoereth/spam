import angular from 'angular';

import routes from '../app/services/routes';
import userService from './services/user';

const routing = [
  'RoutesProvider',
  RoutesProvider => {
    RoutesProvider.add('/~/logout', {
      access: 1,
      controller: 'UserLogoutController',
      template: '',
      title: 'Logout',
    });
  },
];

class UserLogoutController {
  static $inject = ['$scope', '$location', 'User'];

  constructor($scope, $location, User) {
    User.logout().then(() => {
      $location.path('/login').search({ loggedout: true }).replace();
    });
  }
}

/**
 * MODULE: spam.user.logout
 * ROUTE: /~/logout
 * CONTROLLER: UserLogoutController
 */
export default angular
  .module('spam.user.logout', [routes, userService])
  .config(routing)
  .controller('UserLogoutController', UserLogoutController).name;
