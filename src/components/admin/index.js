import angular from 'angular';

import migrate from './migrate';
import template from './admin.html';


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/admin', {
    template,
    title: 'Administration',
    access: 32,
  });
}];


/**
 * MODULE: spam.admin
 * ROUTES:
 *   /admin
 *   /admin/migrate
 */
export default angular
  .module('spam.admin', [migrate])
  .config(routing)
  .name;
