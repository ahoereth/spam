(function() {
  'use strict';

  /**
   * MODULE: spam.components.footer
   * DIRECTIVE: footer
   * CONTROLLER: FooterController
   */
  angular
    .module('spam.components.footer', [
      'spam.components.help',
      'spam.components.user.settings',
      'spam.components.user.logout'
    ])
    .directive('footer', footerDirective)
    .controller('FooterController', footerController);




  /* @ngInject */
  function footerDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'components/footer/footer.html',
      controller: 'FooterController',
      controllerAs: 'footer'
    };
  }




  /* @ngInject */
  function footerController(
    $scope
  ) {
    var ctrl = this;

    function userConstruct(event, user) {
      ctrl.user = !!user;
    }

    $scope.$on('user-construct', userConstruct);
    userConstruct();
  }

})();
