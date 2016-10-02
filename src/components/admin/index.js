import angular from 'angular';

import overview from './overview';
import migrate from './migrate';


/**
 * MODULE: spam.admin
 * ROUTES:
 *   /admin
 *   /admin/migrate
 */
export default angular.module('spam.admin', [overview, migrate]).name;
