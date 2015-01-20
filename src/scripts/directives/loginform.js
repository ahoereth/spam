(function() {
  'use strict';

  /**
  * DIRECTIVE: loginform
  */
  angular
    .module('spam.directives')
    .directive('loginform', loginformDirective);

  /* @ngInject */
  function loginformDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'partials/directives/loginform.html',
      /* @ngInject */
      controller: function(
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
    };
  }
})();
