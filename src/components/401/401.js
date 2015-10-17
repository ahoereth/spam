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
    .config(notauthorizedRouting);




  /* @ngInject */
  function notauthorizedRouting(RoutesProvider) {
    RoutesProvider.add('/401', {
      templateUrl: 'components/401/401.html',
      title: 'Not authorized.'
    });
  }

})();
