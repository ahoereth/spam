import angular from 'angular';

import blurOnEnter from '../../lib/blur-on-enter';
import textDownload from '../../lib/text-download';
import tooltips from '../../lib/tooltips';
import restangular from '../../lib/restangular';
import routes from '../../app/services/routes';
import userService from '../services/user';
import matriculationSetter from './matriculation-setter';

import controller from './UserSettingsController';
import template from './settings.html';


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/~/settings', {
    template,
    controller,
    controllerAs: '$ctrl',
    title: ':username\'s settings',
    access: 1,
  });
}];


/**
 * MODULE: spam.user.settings
 * ROUTE: /~/settings
 * CONTROLLER: UserSettingsController
 */
export default angular
  .module('spam.user.settings', [
    restangular, tooltips, blurOnEnter, textDownload, routes, userService,
    matriculationSetter,
  ])
  .config(routing)
  .name;
