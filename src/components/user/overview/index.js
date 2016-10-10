import angular from 'angular';

import iif from '../../lib/iif';
import tooltips from '../../lib/tooltips';
import restangular from '../../lib/restangular';
import routes from '../../app/services/routes';
import userService from '../services/user';
import columns from './columns';
import thesisInput from './thesis-input';
import gradeInput from './grade-input';
import matriculationSetter from '../settings/matriculation-setter';

import controller from './UserOverviewController';
import template from './overview.html';
import './overview.less';


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/~', {
    template,
    controller,
    controllerAs: 'overview',
    title: ':username',
    reloadOnSearch: false,
    access: 1,
  });
}];


/**
 * MODULE: spam.user.overview
 * ROUTE: /~
 * CONTROLLER: UserOverviewController
 */
export default angular
  .module('spam.user.overview', [
    restangular, tooltips, iif, routes, userService, columns, thesisInput,
    gradeInput, matriculationSetter,
  ])
  .config(routing)
  .name;
