(function() {
  'use strict';

  /**
   * MODULE: spam.components.user.login
   * ROUTE: /login
   * CONTROLLER: UserLoginController
   */
  angular
    .module('spam.components.user.login', [
      'ngRoute',
      'spam.components.common.loginform'
    ])
    .config(userLoginRouting)
    .controller('UserLoginController', userLoginController);




  /* @ngInject */
  function userLoginRouting($routeProvider) {
    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
       return Auth.authenticate($route.current.access);
      }
    };

    $routeProvider.when('/login', {
      templateUrl: 'components/user/login/user.login.html',
      controller: 'UserLoginController',
      controllerAs: 'login',
      access: 0,
      title: 'Login',
      resolve: auth
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
