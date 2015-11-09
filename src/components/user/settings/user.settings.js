(function() {
  'use strict';

  /**
   * MODULE: spam.user.settings
   * ROUTE: /~/settings
   * CONTROLLER: UserSettingsController
   */
  angular
    .module('spam.user.settings', [
      'restangular',
      '720kb.tooltips',
      'blurOnEnter',
      'textDownload',
      'spam.app.services.routes',
      'spam.user.services.user',
      'spam.user.settings.matriculation-setter',
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
  function userSettingsController($scope, Restangular, User) {
    var ctrl = this;
    ctrl.user = User.details;

    $scope.$watchGroup(['user.firstname', 'user.lastname'], function(n, o) {
      if (n === o) { return; }

      User.updateUser({
        firstname: n[0],
        lastname:  n[1]
      }, true);
    });

    ctrl.deleteUser = function() {
      User.deleteUser();
    };

    ctrl.export = {
      loading: false,
      data: false,
      init: function() {
        ctrl.export.loading = true;
        ctrl.user.get().then(function(data) {
          ctrl.export.data = JSON.stringify(data.plain(), null, '  ');
          ctrl.export.loading = false;
        });
      }
    };
  }

})();
