(function() {
  'use strict';

  /**
   * MODULE: spam.components.user.settings
   * ROUTE: /~/settings
   * CONTROLLER: UserSettingsController
   */
  angular
    .module('spam.components.user.settings', [
      'blurOnEnter',
      'spam.components.app.services.routes',
      'spam.components.user.services.user',
      'spam.components.user.settings.matriculation-setter',
    ])
    .config(userSettingsRouting)
    .controller('UserSettingsController', userSettingsController);




  /* @ngInject */
  function userSettingsRouting(RoutesProvider) {
    RoutesProvider.add('/~/settings', {
      controller: 'UserSettingsController',
      controllerAs: 'settings',
      templateUrl: 'components/user/settings/user.settings.html',
      title: ':username\'s settings',
      access: 1
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
