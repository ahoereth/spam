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
  function userSettingsCtrl(
    $rootScope,
    $scope,
    $location,
    $timeout
  ) {
    var timer = null, lastState;

    $scope.user = {
      firstname      : $rootScope.user.firstname,
      lastname       : $rootScope.user.lastname,
      mat_year       : $rootScope.user.mat_year,
      mat_term       : $rootScope.user.mat_term,
      regulation_abbr: $rootScope.user.regulation_abbr
    };

    lastState = angular.copy($scope.user);

    $scope.$watch('user', function(next, current) {
      if (angular.equals(next, current)) {
        return;
      }

      $timeout.cancel(timer);
      timer = $timeout($scope.updateUser, 250);
    }, true);

    $scope.updateUser = function() {
      if (angular.equals($scope.user, lastState)) {
        return;
      }

      lastState = angular.copy($scope.user);
      $rootScope.user.updateUser($scope.user);
    };

    $scope.deleteUser = function() {
      $rootScope.user.deleteUser();
    };
  }

})();
