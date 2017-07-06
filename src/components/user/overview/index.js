import angular from 'angular';

import iif from '../../lib/iif';
import tooltips from '../../lib/tooltips';
import restangular from '../../lib/restangular';
import icon from '../../lib/icon';
import routes from '../../app/services/routes';
import userService from '../services/user';
import columns from './columns';
import thesisInput from './thesis-input';
import gradeInput from './grade-input';
import matriculationSetter from '../settings/matriculation-setter';

import controller from './UserOverviewController';
import template from './overview.html';
import './overview.less';

const routing = [
  'RoutesProvider',
  RoutesProvider => {
    RoutesProvider.add('/~', {
      access: 1,
      controller,
      controllerAs: '$ctrl',
      template,
      title: ':username',
      reloadOnSearch: false,
    });
  },
];

/**
 * MODULE: spam.user.overview
 * ROUTE: /~
 * CONTROLLER: UserOverviewController
 */
export default angular
  .module('spam.user.overview', [
    columns,
    gradeInput,
    icon,
    iif,
    restangular,
    routes,
    thesisInput,
    tooltips,
    matriculationSetter,
    userService,
  ])
  .config(routing).name;
