(function() {
  'use strict';

  /**
   * CONTROLLER: UserMatVerify
   * ROUTES: /~
   *         /~/settings
   */
  angular
    .module('spam.controllers.user')
    .controller('UserMatVerify', userMatriculationCtrl);


  /* @ngInject */
  function userMatriculationCtrl(
    $scope,
    $log,
    DataHandler,
    _
  ) {
    var currentYear = new Date().getFullYear();
    $scope.years = _.range(currentYear, currentYear-3, -1);

    $scope.verify = {
      mat_year  : ! _.isEmpty($scope.user.mat_year) ? $scope.user.mat_year : currentYear,
      mat_term  : ! _.isEmpty($scope.user.mat_term) ? $scope.user.mat_term : 'W',
      mat_verify: 0
    };

    $scope.doVerify = function() {
      $scope.verify.mat_verify = 1;
      $scope.user.updateUser($scope.verify);
    };
  }

})();
