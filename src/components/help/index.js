import angular from 'angular';
import ngRoute from 'angular-route';

import icon from '../lib/icon';
import routes from '../app/services/routes';
import fragment from './help-fragment';

import controller from './HelpController';
import template from './help.html';
import './help.less';

const routing = [
  'RoutesProvider',
  RoutesProvider => {
    RoutesProvider.add('/help/:subject*?', {
      controller,
      template,
      title: 'Help',
    });

    RoutesProvider.add('/help', { redirectTo: '/help/remember' });
  },
];

/**
 * MODULE: spam.help
 * ROUTE: /help
 */
export default angular
  .module('spam.help', [ngRoute, routes, fragment, icon])
  .config(routing).name;
