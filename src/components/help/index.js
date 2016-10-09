import angular from 'angular';
import ngRoute from 'angular-route';

import routes from '../app/services/routes';
import fragment from './help-fragment';

import controller from './HelpController';
import template from './help.html';
import './help.less';


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/help/:subject*?', {
    template,
    controller,
    title: 'Help',
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
  .config(routing)
  .name;
