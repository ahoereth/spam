(function() {
  'use strict';

  /**
   * MODULE: spam.user.login.form
   * DIRECTIVE: loginform
   * CONTROLLER: LoginformController
   */
  angular
    .module('spam.user.login.form', [
      'ngRoute', // $routeParams
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
      scope: {
        username: '=',
        loading: '='
      },
      templateUrl: 'components/user/login/form/user.login.form.html',
      controller: 'LoginformController',
      controllerAs: 'loginform',
      bindToController: true
    };
  }




  /* @ngInject */
  function loginformController(
    $location,
    $routeParams,
    Auth
  ) {
    var ctrl = this;

    ctrl.login = function() {
      var self = this;

      Auth.init(
        self.username,
        self.password,
        self.remember
      ).then(function() {
        var path = $routeParams.path || '/~';
        $location.path(path).search({});
      }, function() {
        $location.path('/login').search({username: self.username});
      });
    };

    if ('' === ctrl.username) {
      ctrl.username = $routeParams.username || '';
    }
  }

})();
