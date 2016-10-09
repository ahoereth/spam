import angular from 'angular';
import ngRoute from 'angular-route';

import routes from '../app/services/routes';
import fragment from './help-fragment';
import HelpController from './HelpController';

import './help.less';


const helpRouting = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/help/:subject*?', {
    controller: 'HelpController',
    templateUrl: 'components/help/help.html',
    title: 'Help'
  });

  RoutesProvider.add('/help', {
    redirectTo: '/help/remember'
  });
}];


/**
 * MODULE: spam.help
 * CONTROLLER: HelpController
 * ROUTE: /help
 */
export default angular
  .module('spam.help', [ngRoute, routes, fragment])
  .controller('HelpController', HelpController)
  .config(helpRouting)
  .name;
