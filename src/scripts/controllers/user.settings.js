(function() {
  'use strict';

  /**
   * CONTROLLER: UserSettings
   * ROUTE: /~/settings
   */
  angular
    .module('spam.controllers.user')
    .controller('UserSettings', userSettingsCtrl);


  /* @ngInject */
  function userSettingsCtrl($scope) {
    $scope.$watchGroup(['user.firstname', 'user.lastname'], function(n, o) {
      if (n === o) { return; }

      $scope.user.updateUser({
        firstname: n[0],
        lastname:  n[1]
      }, true);
    });

    $scope.deleteUser = function() {
      $scope.user.deleteUser();
    };
  }

})();
