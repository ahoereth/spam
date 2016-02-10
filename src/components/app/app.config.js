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
    .config(saveInternalLinks)
    .run(appConfigRun);




  /* @ngInject */
  function appConfig(
    $httpProvider,
    RestangularProvider,
    APIURL
  ) {
    // intercept http requests for general error handling and loading animation
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




  /**
   * Add the local root links to the href whitelist.
   *
   * @ngInject
   */
  function saveInternalLinks($compileProvider) {
    var whitelist = ('' + $compileProvider.aHrefSanitizationWhitelist());
    if (whitelist.charAt(whitelist.length-1) === '/') {
      whitelist = whitelist.slice(0, whitelist.length-1);
    } else {
      whitelist = '/';
    }
    whitelist += '|\\//';
    $compileProvider.aHrefSanitizationWhitelist(whitelist);
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
