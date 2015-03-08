(function() {
  'use strict';

  angular
    .module('spam')
    .config(configuration);


  /* @ngInject */
  function configuration(
    $httpProvider,
    RestangularProvider,
    LOCALAPI,
    APIURL
  ) {
    // intercept http requests for general error handling and loading animation
    $httpProvider.interceptors.push('httpIntercept');

    // Set restangular api base url.
    // If the app instance runs on the /~SPAM path we expect the API to run
    // on the same server (either in production or in development with local
    // dev API server), if the app runs on root / we utilize the remote
    // production API.
    var api = LOCALAPI ? '/api' : APIURL;
    RestangularProvider.setBaseUrl(api);
  }
})();
