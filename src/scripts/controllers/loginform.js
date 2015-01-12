(function() {
  'use strict';

  /**
   * CONTROLLER: Loginform
   *
   * Contains the loginform functionality which triggers authentication and
   * redirects appropriately.
   */
  angular
    .module('spam.controllers')
    .controller('Loginform', loginformCtrl);


  /* @ngInject */
  function loginformCtrl(
    $rootScope,
    $scope,
    $location,
    $routeParams,
    Auth,
    _
  ) {
    $rootScope.loginform = { username: $routeParams.username };

    /**
     * User login
     */
    $scope.login = function() {
      var t = this.loginform;
      t.loading = true;

      Auth.init(
        t.username,
        t.password,
        t.remember
      ).then(function() {
        var targetRoute = _.isEmpty($rootScope.requested_route) ? '/~' : $rootScope.requested_route;
        $location.path(targetRoute).search({});
      }, function() {
        $location.path('/login').search({username: t.username});
      });
    };
  }
})();
