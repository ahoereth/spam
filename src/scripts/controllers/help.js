(function() {
  'use strict';

  /**
   * CONTROLLER: Help
   * ROUTE: /help
   */
  angular
    .module('spam.controllers')
    .controller('Help', helpCtrl);


  /* @ngInject */
  function helpCtrl(
    $scope,
    $location,
    $routeParams
  ) {
    $scope.opened =  $routeParams.subject || '';

    $scope.open = function(subject) {
      subject = ($scope.opened !== subject) ? subject : '';

      // this (sadly) reloads the route
      $location.path('/help/' + subject);

      // add this as soon as the route reloading problem is fixed
      // $scope.opened = subject;
    };
  }
})();
