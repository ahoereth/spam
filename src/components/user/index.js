import angular from 'angular';

import services from './services';
import overview from './overview';
import settings from './settings';
import logout from './logout';
import courses from './courses';
import login from './login';

/**
 * MODULE: spam.user
 * ROUTES:
 *   /login
 *   /~
 * SERVICES:
 *   User
 *   Auth
 */
export default angular.module('spam.user', [
  courses,
  logout,
  login,
  overview,
  services,
  settings,
]).name;
