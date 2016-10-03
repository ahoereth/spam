import angular from 'angular';

import migrate from './migrate';


const adminRouting = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/admin', {
    templateUrl: 'components/admin/overview/overview.html',
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
  .config(adminRouting)
  .name;
