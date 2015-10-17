(function() {
  'use strict';

  /**
   * MODULE: spam.user.logout
   * ROUTE: /~/logout
   * CONTROLLER: UserLogoutController
   */
  angular
    .module('spam.user.logout', [
      'spam.app.services.routes',
      'spam.user.services.user'
    ])
    .config(userLogoutRouting)
    .controller('UserLogoutController', userLogoutController);




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

})();
