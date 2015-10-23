(function() {
  'use strict';

  /**
   * MODULE: spam.landing
   * ROUTE: /
   */
  angular
    .module('spam.landing', [
      'iifFilter',
      'spam.app.services.routes',
      'spam.user.services.user',
      'spam.user.login.form'
    ])
    .config(landingRouting)
    .controller('LandingController', landingController);




  /* @ngInject */
  function landingRouting(RoutesProvider) {
    RoutesProvider.add('/', {
      templateUrl: '/components/landing/landing.html',
      controller: 'LandingController',
      controllerAs: 'landing'
    });

    RoutesProvider.add('/.', {
      redirectTo: '/'
    });

    RoutesProvider.add('*', {
      redirectTo: '/'
    });
  }




  /* @ngInject */
  function landingController($scope, Restangular, User) {
    var ctrl = this;

    function userConstruct(event, user) {
      if (!user) {
        ctrl.loggedin = false;
        ctrl.username = '';
      } else {
        ctrl.loggedin = true;
        ctrl.username = user.username;
      }
    }

    ctrl.stats = Restangular.one('/stats').get().$object;

    $scope.$on('user-construct', userConstruct);
    userConstruct(null, User.details);
    ctrl.loginloading = false;
  }

})();
