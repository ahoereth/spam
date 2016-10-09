import angular from 'angular';
import { assign, assignIn, map, pick, debounce } from 'lodash-es';

import { APIURL, O2URL } from '../../app/constants';
import routes from '../../app/services/routes';
import courseRow from '../../courses/row';
import instafocus from '../../lib/instafocus';
import inlineSelectables from '../../lib/inline-selectables';
import restangular from '../../lib/restangular';
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
    restangular,
    instafocus,
    inlineSelectables,
    buttons,
    year,
    courseRow,
    routes,
  ])
  .config(routing)
  .name;
