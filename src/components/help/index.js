import angular from 'angular';
import ngRoute from 'angular-route';

import routes from '../app/services/routes';
import fragment from './help-fragment';

// import './help.less';


/**
 * MODULE: spam.help
 * CONTROLLER: HelpController
 * ROUTE: /help
 */
export default angular
  .module('spam.help', [ngRoute, routes, fragment])
  .config(helpRouting)
  .controller('HelpController', helpController)
  .name;




/* @ngInject */
function helpRouting(RoutesProvider) {
  RoutesProvider.add('/help/:subject*?', {
    controller: 'HelpController',
    templateUrl: 'components/help/help.html',
    title: 'Help'
  });

  RoutesProvider.add('/help', {
    redirectTo: '/help/remember'
  });
}




/* @ngInject */
function helpController(
  $scope,
  $location,
  $routeParams
) {
  $scope.opened =  $routeParams.subject || '';

  $scope.open = function(subject) {
    subject = ($scope.opened !== subject) ? subject : '';
    $location.path('/help/' + subject);
  };
}
