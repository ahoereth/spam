import angular from 'angular';

import help from '../help';
import settings from '../user/settings';
import logout from '../user/logout';


/**
 * MODULE: spam.footer
 * DIRECTIVE: footer
 * CONTROLLER: FooterController
 */
export default angular
  .module('spam.footer', [help, settings, logout])
  .directive('footer', footerDirective) // TODO: migrate to component
  .controller('FooterController', footerController)
  .name;




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
