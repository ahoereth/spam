import angular from 'angular';

import routes from '../app/services/routes';
import userService from './services/user';

/**
 * MODULE: spam.user.logout
 * ROUTE: /~/logout
 * CONTROLLER: UserLogoutController
 */
export default angular
  .module('spam.user.logout', [routes, userService])
  .config(userLogoutRouting)
  .controller('UserLogoutController', userLogoutController)
  .name;




/* @ngInject */
function userLogoutRouting(RoutesProvider) {
  RoutesProvider.add('/~/logout', {
    controller: 'UserLogoutController',
    template: '',
    title : 'Logout',
    access: 1
  });
}




/* @ngInject */
function userLogoutController(
  $scope,
  $location,
  User
) {
  // 1. Logout.
  User.logout().then(function() {
    // 2. Redirect.
    $location
      .path('/login')
      .search({loggedout: true})
      .replace();
  });
}
