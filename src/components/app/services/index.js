import angular from 'angular';

import httpIntercept from './http-intercept';
import routes from './routes';


/**
 * MODULE: spam.app.services
 */
export default angular
  .module('spam.app.services', [
    'spam.app.services.routes',
    'spam.app.services.http-intercept'
  ])
  .name;
