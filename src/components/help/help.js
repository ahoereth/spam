(function() {
  'use strict';

  /**
   * MODULE: spam.components.help
   * CONTROLLER: HelpController
   * ROUTE: /help
   */
  angular
    .module('spam.components.help', [
      'ngRoute', // $routeParams
      'spam.components.app.services.routes',
      'spam.components.help.fragment'
    ])
    .config(helpRouting)
    .controller('HelpController', helpController);




  /* @ngInject */
  function helpRouting(RoutesProvider) {
    RoutesProvider.add('/help/:subject*?', {
      controller: 'HelpController',
      templateUrl: 'components/help/help.html',
      title: 'Help'
    });

    RoutesProvider.add('/help', {
      redirectTo: '/help/remember'
    });
  }




  /* @ngInject */
  function helpController(
    $scope,
    $location,
    $routeParams
  ) {
    $scope.opened =  $routeParams.subject || '';

    $scope.open = function(subject) {
      subject = ($scope.opened !== subject) ? subject : '';
      $location.path('/help/' + subject);
    };
  }

})();
