(function() {
  'use strict';

  /**
   * CONTROLLER: Logout
   * ROUTE: /~/logout
   */
  angular
    .module('spam.components.user.logout', [
      'ngRoute',
      'progressbar',
      'blurOnEnter',
      'dropdown',
      'tickable',
      'instafocus',
      'spam.services',
      'spam.directives'
    ])
    .config(userLogoutRouting)
    .controller('UserLogoutCtrl', userLogoutCtrl);




  /* @ngInject */
  function userLogoutRouting($routeProvider) {
    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
        return Auth.authenticate($route.current.access);
      }
    };

    $routeProvider.when('/~/logout', {
      controller: 'UserLogoutCtrl',
      title : 'Logout',
      access: 1,
      resolve: auth
    });
  }




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
