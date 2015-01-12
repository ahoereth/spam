(function() {
  'use strict';

  /**
   * CONTROLLER: Login
   * ROUTE: /login
   *
   * The login page which can get passed a username parameter for prefilling
   * the username form field.
   */
  angular
    .module('spam.controllers')
    .controller('Login', loginCtrl);


  /* @ngInject */
  function loginCtrl(
    $scope,
    $routeParams
  ) {
    $scope.params = $routeParams;
  }
})();
