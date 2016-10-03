import angular from 'angular';
import { initial } from 'lodash-es';

import { DEBUG, APIURL } from './constants';
import restangular from '../lib/restangular';
import './services/http-intercept';


const appConfig = [
  '$compileProvider', '$httpProvider', 'RestangularProvider',
  function appConfig($compileProvider, $httpProvider, RestangularProvider) {
    // Enable/disable debugging. Dev-console: `angular.reloadWithDebugInfo()`.
    $compileProvider.debugInfoEnabled(DEBUG);
    // Intercept http requests for general error handling and loading animation.
    $httpProvider.interceptors.push('httpIntercept');
    // Set restangular api base url.
    RestangularProvider.setBaseUrl(APIURL);
    // Send empty payload on `DELETE` requests.
    RestangularProvider.setRequestInterceptor(
      (elem, operation) => ('remove' === operation) ? null : elem
    );
  }
]


const appConfigRun = ['Restangular', function appConfigRun(Restangular) {
  Restangular.configuration.getIdFromElem = function(elem) {
    const { id, route, username } = elem;
    const { parentResource: par, student_in_course_id: sic_id } = elem;
    if (id) { return id; }
    if (route === 'users') { return username; }
    if (route === 'courses' && par && par.route === 'users') { return sic_id; }
    return elem[initial(route).join('') + '_id'];
  };
}];


/**
 * MODULE: spam.app.config
 */
export default angular
  .module('spam.app.config', [restangular])
  .config(appConfig)
  .run(appConfigRun)
  .name;
