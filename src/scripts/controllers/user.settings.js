(function() {
  'use strict';

  /**
   * CONTROLLER: UserSettingsController
   * ROUTE: /~/settings
   */
  angular
    .module('spam.controllers.user')
    .controller('UserSettingsController', userSettingsController);


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
