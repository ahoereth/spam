(function() {
  'use strict';

  /**
   * MODULE: spam.components.user.settings
   * ROUTE: /~/settings
   * CONTROLLER: UserSettingsController
   */
  angular
    .module('spam.components.user.settings', [
      'ngRoute',
      'blurOnEnter',
      'spam.services'
    ])
    .config(userSettingsRouting)
    .controller('UserSettingsController', userSettingsController);




  /* @ngInject */
  function userSettingsRouting($routeProvider) {
    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
        return Auth.authenticate($route.current.access);
      }
    };

    $routeProvider.when('/~/settings', {
      templateUrl: 'components/user/settings/user.settings.html',
      controller: 'UserSettingsController',
      controllerAs: 'settings',
      title: ':username\'s settings',
      access: 1,
      resolve: auth
    });
  }




  /* @ngInject */
  function userSettingsController($scope, User) {
    this.user = User.details;

    $scope.$watchGroup(['user.firstname', 'user.lastname'], function(n, o) {
      if (n === o) { return; }

      User.updateUser({
        firstname: n[0],
        lastname:  n[1]
      }, true);
    });

    this.deleteUser = function() {
      User.deleteUser();
    };
  }

})();
