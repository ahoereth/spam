(function() {
  'use strict';

  /**
   * MODULE: spam.components.user.login
   * ROUTE: /login
   * CONTROLLER: UserLoginController
   */
  angular
    .module('spam.components.user.login', [
      'ngRoute', // $routeParams
      'spam.components.app.services.routes',
      'spam.components.user.login.form'
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
