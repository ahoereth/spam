(function() {
  'use strict';

  /**
   * CONTROLLER: Logout
   * ROUTE: /~/logout
   *
   * Forcing a logout is navigatable on purpose.
   *
   * TODO: Implement logout error handling.
   */
  angular
    .module('spam.controllers.user')
    .controller('LogoutCtrl', userLogoutCtrl);


  /* @ngInject */
  function userLogoutCtrl(
    $scope,
    $location,
    User
  ) {
    // 1. Logout.
    User.logout();

    // 2. Redirect.
    $location
      .path('/login')
      .search({loggedout: true})
      .replace();
  }

})();
