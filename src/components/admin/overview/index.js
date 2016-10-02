import angular from 'angular';

import routes from '../../app/services/routes';


/**
 * MODULE: spam.admin.migrate
 * ROUTE: /admin/migrate
 * CONTROLLER: AdminMigrateController
 */
export default angular
  .module('spam.admin.index', [routes])
  .config(adminIndexRouting)
  .name;




/* @ngInject */
function adminIndexRouting(RoutesProvider) {
  RoutesProvider.add('/admin', {
    templateUrl: 'components/admin/overview/admin.overview.html',
    title: 'Administration',
    access: 32
  });
}
