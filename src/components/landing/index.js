import angular from 'angular';

import iif from '../lib/iif';
import restangular from '../lib/restangular';
import routes from '../app/services/routes';
import userService from '../user/services/user';
import loginform from '../user/login/form';


/**
 * MODULE: spam.landing
 * ROUTE: /
 */
export default angular
  .module('spam.landing', [
    restangular,
    iif,
    routes,
    userService,
    loginform
  ])
  .config(landingRouting)
  .controller('LandingController', landingController)
  .name;




/* @ngInject */
function landingRouting(RoutesProvider) {
  RoutesProvider.add('/', {
    templateUrl: 'components/landing/landing.html',
    controller: 'LandingController',
    controllerAs: 'landing'
  });

  RoutesProvider.add('/.', {
    redirectTo: '/'
  });

  RoutesProvider.add('*', {
    redirectTo: '/'
  });
}




/* @ngInject */
function landingController($scope, Restangular, User) {
  var ctrl = this;

  function userConstruct(event, user) {
    if (!user) {
      ctrl.loggedin = false;
      ctrl.username = '';
    } else {
      ctrl.loggedin = true;
      ctrl.username = user.username;
    }
  }

  ctrl.stats = Restangular.one('/stats').get().$object;

  $scope.$on('user-construct', userConstruct);
  userConstruct(null, User.details);
  ctrl.loginloading = false;
}
