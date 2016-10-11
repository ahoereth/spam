import angular from 'angular';
import { initial } from 'lodash-es';

import { DEBUG, APIURL } from '../../config';
import restangular from '../lib/restangular';
import './services/http-intercept';


/* @ngInject */
function appConfig($compileProvider, $httpProvider, RestangularProvider) {
  // Enable/disable debugging. Dev-console: `angular.reloadWithDebugInfo()`.
  $compileProvider.debugInfoEnabled(DEBUG);
  // Intercept http requests for general error handling and loading animation.
  $httpProvider.interceptors.push('httpIntercept');
  // Set restangular api base url.
  RestangularProvider.setBaseUrl(APIURL);
  // Send empty payload on `DELETE` requests.
  RestangularProvider.setRequestInterceptor(
    (elem, operation) => ((operation === 'remove') ? null : elem)
  );
}


/* @ngInject */
function appConfigRun(Restangular) {
  Restangular.configuration.getIdFromElem = function getIdFromElem(elem) {
    const { id, route, username } = elem;
    const { parentResource: par, student_in_course_id: sicId } = elem;
    if (id) { return id; }
    if (route === 'users') { return username; }
    if (route === 'courses' && par && par.route === 'users') { return sicId; }
    return elem[`${initial(route).join('')}_id`];
  };
}


/**
 * MODULE: spam.app.config
 */
export default angular
  .module('spam.app.config', [restangular])
  .config(appConfig)
  .run(appConfigRun)
  .name;
