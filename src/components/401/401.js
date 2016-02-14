(function() {
  'use strict';

  /**
   * MODULE: spam.401
   * ROUTE: /401
   */
  angular
    .module('spam.401', [
      'unicorn-directive',
      'spam.app.services.routes',
      'spam.user.login.form'
    ])
    .config(notauthorizedRouting)
    .controller('NotauthorizedController', notauthorizedController);




  /* @ngInject */
  function notauthorizedRouting(RoutesProvider) {
    RoutesProvider.add('/401', {
      templateUrl: 'components/401/401.html',
      controller: 'NotauthorizedController',
      controllerAs: '$ctrl',
      title: 'Not authorized.'
    });
  }




  /* @ngInject */
  function notauthorizedController($scope, $routeParams, User) {
    var $ctrl = this;

    function userConstruct(event, user) {
      if (!user) {
        $ctrl.user = false;
      } else {
        $ctrl.user = {
          username: user.username,
          role: user.role,
          rank: user.rank
        };
      }
    }

    userConstruct(undefined, User.details);
    $scope.$on('user-construct', userConstruct);
    $ctrl.lastroute = $routeParams.path;
  }

})();
