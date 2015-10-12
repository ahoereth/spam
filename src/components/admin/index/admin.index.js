(function() {
  'use strict';

  /**
   * MODULE: spam.components.admin.index
   * ROUTE: /admin
   */
  angular
    .module('spam.components.admin.index', [])
    .config(adminIndexRouting);




  /* @ngInject */
  function adminIndexRouting($routeProvider) {
    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
        return Auth.authenticate($route.current.access);
      }
    };

    $routeProvider.when('/admin', {
      templateUrl: 'components/admin/index/admin.index.html',
      title: 'Administration',
      access: 32,
      resolve: auth
    });
  }

})();
