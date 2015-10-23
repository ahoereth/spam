(function() {
  'use strict';

  /**
   * MODULE: spam.app.config
   */
  angular
    .module('spam.app.config', [
      'restangular',
      'lodash',
      'spam.app.constants'
    ])
    .config(appConfig)
    .run(appConfigRun);




  /* @ngInject */
  function appConfig(
    $httpProvider,
    RestangularProvider,
    LOCALAPI,
    LOCALAPIURL,
    APIURL
  ) {
    // intercept http requests for general error handling and loading animation
    $httpProvider.interceptors.push('httpIntercept');

    // Set restangular api base url.
    // If the app instance runs on the /~SPAM path we expect the API to run
    // on the same server (either in production or in development with local
    // dev API server), if the app runs on root / we utilize the remote
    // production API.
    var api = LOCALAPI ? LOCALAPIURL : APIURL;
    RestangularProvider.setBaseUrl(api);

    // Send empty payload on `DELETE` requests.
    RestangularProvider.setRequestInterceptor(function(elem, operation) {
      if ('remove' === operation) {
         return null;
      }

      return elem;
    });
  }




  /* @ngInject */
  function appConfigRun(Restangular, _) {
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
        var e = elem[_.initial(elem.route).join('') + '_id'];
        return e;
      }
    };
  }

})();
