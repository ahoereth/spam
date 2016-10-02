import angular from 'angular';

import unicorn from '../lib/unicorn';
import routes from '../app/services/routes';
import userLoginForm from '../user/login/form';


/**
 * MODULE: spam.401
 * ROUTE: /401
 */
export default angular
  .module('spam.401', [
    unicorn,
    routes,
    userLoginForm
  ])
  .config(notauthorizedRouting)
  .controller('NotauthorizedController', notauthorizedController)
  .name;




/* @ngInject */
function notauthorizedRouting(RoutesProvider) {
  RoutesProvider.add('/401', {
    templateUrl: 'components/401/401.html',
    controller: 'NotauthorizedController',
    controllerAs: '$ctrl',
    title: 'Not authorized.'
  });
}




/* @ngInject */
function notauthorizedController($scope, $routeParams, User) {
  var ctrl = this;

  function userConstruct(event, user) {
    if (!user) {
      ctrl.user = false;
    } else {
      ctrl.user = {
        username: user.username,
        role: user.role,
        rank: user.rank
      };
    }
  }

  userConstruct(undefined, User.details);
  $scope.$on('user-construct', userConstruct);
  ctrl.lastroute = $routeParams.path;
}
