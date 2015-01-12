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

    // set restangular api base url
    RestangularProvider.setBaseUrl('/~SPAM/api');
  }
})();
