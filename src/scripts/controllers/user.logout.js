(function() {
  'use strict';

  /**
   * CONTROLLER: Logout
   * ROUTE: /~/logout
   */
  angular
    .module('spam.controllers.user')
    .controller('Logout', userLogoutCtrl);


  /* @ngInject */
  function userLogoutCtrl(
    $scope,
    $location
  ) {
    $scope.user.destroy();
    $location.path('/login').search({loggedout: true}).replace();
  }

})();
