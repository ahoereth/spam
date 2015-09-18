(function() {
  'use strict';

  /**
   * CONTROLLER: Help
   * ROUTE: /help
   */
  angular
    .module('spam.components.help', [
      'ngRoute',
      'spam.components.help.help-fragment'
    ])
    .config(helpRouting)
    .controller('HelpController', helpController);




  /* @ngInject */
  function helpRouting($routeProvider) {
    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
        return Auth.authenticate($route.current.access);
      }
    };

    $routeProvider.when('/help/:subject*?', {
      templateUrl: 'components/help/help.html',
      controller: 'HelpController',
      title: 'Help',
      access: 0,
      resolve: auth
    });

    $routeProvider.when('/help', {
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
