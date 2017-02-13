import angular from 'angular';

import routes from '../../app/services/routes';
import courseRow from '../../courses/row';
import instafocus from '../../lib/instafocus';
import inlineSelectables from '../../lib/inline-selectables';
import restangular from '../../lib/restangular';
import icon from '../../lib/icon';
import buttons from '../../lib/buttons';
import year from '../../lib/year';

import controller from './AdminMigrateController';
import template from './migrate.html';


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/admin/migrate', {
    template,
    controller,
    controllerAs: 'migrate',
    title: 'IKW DB Migration',
    reloadOnSearch: false,
    access: 32,
  });
}];


/**
 * MODULE: spam.admin.migrate
 * ROUTE: /admin
 */
export default angular
  .module('spam.admin.migrate', [
    restangular, instafocus, inlineSelectables, buttons, year, courseRow,
    routes, icon,
  ])
  .config(routing)
  .name;
