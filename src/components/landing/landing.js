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
      'spam.user.login.form'
    ])
    .config(landingRouting);




  /* @ngInject */
  function landingRouting(RoutesProvider) {
    RoutesProvider.add('/', {
      templateUrl: '/components/landing/landing.html'
    });

    RoutesProvider.add('/.', {
      redirectTo: '/'
    });

    RoutesProvider.add('*', {
      redirectTo: '/'
    });
  }

})();
