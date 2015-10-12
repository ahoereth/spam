(function() {
  'use strict';

  /**
   * CONTROLLER: Logout
   * ROUTE: /~/logout
   */
  angular
    .module('spam.components.user.logout', [
      'ngRoute',
      'spam.services'
    ])
    .config(userLogoutRouting)
    .controller('UserLogoutController', userLogoutController);




  /* @ngInject */
  function userLogoutRouting($routeProvider) {
    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
        return Auth.authenticate($route.current.access);
      }
    };

    $routeProvider.when('/~/logout', {
      template: '',
      controller: 'UserLogoutController',
      title : 'Logout',
      access: 1,
      resolve: auth
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
