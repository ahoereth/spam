(function() {
  'use strict';

  /**
   * MODULE: spam.user.login.form
   * DIRECTIVE: loginform
   * CONTROLLER: LoginformController
   */
  angular
    .module('spam.user.login.form', [
      'lodash',
      'iifFilter',
      'spam.user.services.auth'
    ])
    .directive('loginform', loginformDirective)
    .controller('LoginformController', loginformController);




  /* @ngInject */
  function loginformDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'components/user/login/form/user.login.form.html',
      controller: 'LoginformController'
    };
  }




  /* @ngInject */
  function loginformController(
    $rootScope,
    $scope,
    $location,
    $routeParams,
    Auth,
    _
  ) {
    $rootScope.loginform = _.extend(
      $rootScope.loginform || {},
      {username: $routeParams.username}
    );

    /**
     * Trigger the login request.
     */
    $scope.login = function() {
      var t = this.loginform;

      Auth.init(
        t.username,
        t.password,
        t.remember
      ).then(function() {
        var targetRoute = ! _.isEmpty($rootScope.requested_route) ?
          $rootScope.requested_route : '/~';

        $location.path(targetRoute).search({});
      }, function() {
        $location.path('/login').search({username: t.username});
      });
    };
  }

})();
