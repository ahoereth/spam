(function() {
  'use strict';

  /**
   * MODULE: spam.components.app
   * DIRECTIVE: app
   * CONTROLLER: AppController
   */
  angular
    .module('spam.components.app', [
      'spam.components.navbar',
      'spam.components.notifications'
    ])
    .directive('app', appDirective)
    .controller('AppController', appController);




  /* @ngInject */
  function appDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'components/app/app.html',
      controller: 'AppController',
      controllerAs: 'app'
    };
  }




  /* @ngInject */
  function appController(
    $scope,
    $location,
    _
  ) {
    var ctrl = this;

    function userConstruct(event, user) {
      ctrl.user = !!user;
    }

    function updateBodyClass() {
      var name = _.kebabCase($location.path().replace('~', 'user'));
      name = name ? name : 'root';
      ctrl.classnames = name;
    }

    $scope.$on('user-construct', userConstruct);
    $scope.$on('$locationChangeStart', updateBodyClass);
    updateBodyClass(); // Init.
    userConstruct();
  }
})();
