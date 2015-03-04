(function() {
  'use strict';

  angular
    .module('spam')
    .config(configuration);


  /* @ngInject */
  function configuration(
    $httpProvider,
    RestangularProvider
  ) {
    // intercept http requests for general error handling and loading animation
    $httpProvider.interceptors.push('httpIntercept');

    // Set to false to use local api instead of production api deployed on
    // IKW servers.
    var ikw = true;

    // Set restangular api base url.
    // If the app instance runs on the /~SPAM path we expect the API to run
    // on the same server (either in production or in development with local
    // dev API server), if the app runs on root / we utilize the remote
    // production API.
    var api = ikw ? 'https://cogsci.uni-osnabrueck.de/~SPAM/api' : '/api';
    RestangularProvider.setBaseUrl(api);
  }
})();
