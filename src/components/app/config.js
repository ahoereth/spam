import angular from 'angular';
import 'restangular';

import { DEBUG, APIURL } from './constants';


/**
 * MODULE: spam.app.config
 */
export default angular
  .module('spam.app.config', ['restangular'])
  .config(appConfig)
  .run(appConfigRun)
  .name;




/* @ngInject */
function appConfig($compileProvider, $httpProvider, RestangularProvider) {
  // Enable/disable debugging.
  // To enable debugging on the fly use `angular.reloadWithDebugInfo()`.
  $compileProvider.debugInfoEnabled(DEBUG);

  // Intercept http requests for general error handling and loading animation.
  $httpProvider.interceptors.push('httpIntercept');

  // Set restangular api base url.
  RestangularProvider.setBaseUrl(APIURL);

  // Send empty payload on `DELETE` requests.
  RestangularProvider.setRequestInterceptor(function(elem, operation) {
    if ('remove' === operation) {
       return null;
    }

    return elem;
  });
}




/* @ngInject */
function appConfigRun(Restangular) {
  Restangular.configuration.getIdFromElem = function(elem) {
    if (elem.id) {
      return elem.id;
    }

    if (elem.route === 'users') {
      return elem.username;
    } else if (
      elem.route === 'courses' &&
      elem.parentResource && elem.parentResource.route === 'users'
    ) {
      return elem.student_in_course_id;
    } else {
      var e = elem[elem.route.slice(0, -1).join('') + '_id'];
      return e;
    }
  };
}
