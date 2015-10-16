(function() {
  'use strict';

  /**
   * MODULE: spam.components.landing
   * ROUTE: /
   */
  angular
    .module('spam.components.landing', [
      'spam.components.app.services.routes',
      'spam.components.user.login.form'
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
