import angular from 'angular';

import user from './user';
import auth from './auth';

/**
 * MODULE: spam.app.services
 */
export default angular.module('spam.user.services', [user, auth]).name;
