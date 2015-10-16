(function() {
  'use strict';

  /**
   * MODULE: spam.components.401
   * ROUTE: /401
   */
  angular
    .module('spam.components.401', [
      'unicorn-directive',
      'spam.components.app.services.routes',
      'spam.components.user.login.form'
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
