(function() {
  'use strict';

  /**
   * MODULE: spam.user.login
   * ROUTE: /login
   * CONTROLLER: UserLoginController
   */
  angular
    .module('spam.user.login', [
      'ngRoute', // $routeParams
      'spam.app.services.routes',
      'spam.user.login.form'
    ])
    .config(userLoginRouting)
    .controller('UserLoginController', userLoginController);




  /* @ngInject */
  function userLoginRouting(RoutesProvider) {
    RoutesProvider.add('/login', {
      controller: 'UserLoginController',
      controllerAs: 'login',
      templateUrl: 'components/user/login/user.login.html',
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

})();
