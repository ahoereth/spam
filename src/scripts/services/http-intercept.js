(function() {
  'use strict';

  /**
   * Used for intercepting all HTTP requests (using $http and $resource).
   *
   * On the one hand the interceptor updates the $rootScope.loading variable
   * which is used for displaying the loading animation to the user; On the
   * other hand every failed request is repeated 2 more times with a timely
   * offset of 5 seconds.
   *
   * @broadcasts http:error           On every failed request
   * @broadcasts http:error:permanent When a request was retried it's maximum
   *                                  amount of times
   * @broadcasts http:error:resolved  When a request failed at least once before
   *                                  could be resolved now
   */
  angular
    .module('spam.services')
    .factory('httpIntercept', httpInterceptFactory);


  /* @ngInject */
  function httpInterceptFactory(
    $injector,
    $rootScope,
    $q,
    $timeout,
    $location
  ) {
    $rootScope.loading = 0;

    /** How often to retry a request. */
    var retriesPerRequest = 2;

    /** How long to wait for starting the next round of retries. */
    var retryTimeoutTime = 5000;

    /** Holds all the requests, so they can be re-requested in future. */
    var buffer = [];

    /** Service initialized later because of circular dependency problem. */
    var $http;

    /** Holds the retry $timeout for deferring. */
    var retryTimeout;

    /**
    * Wrapper for retrying a request. Mostly falls back to its ancestors default behavior.
    */
    var retryHttpRequest = function(config, deferred) {
      function successCallback(response) {
        deferred.resolve(response);
      }
      function errorCallback(response) {
        deferred.reject(response);
      }

      // initialize $http service
      $http = $http || $injector.get('$http');

      // refire request
      $http(config).then(successCallback, errorCallback);
    };

    /**
    * Retries all the buffered requests clears the buffer.
    */
    var retryAll = function () {
      if (buffer.length === 0) { return; }

      var tmp;
      while (tmp = buffer.shift()) {
        tmp.config.retry = typeof tmp.config.retry === 'undefined' ? 1 : tmp.config.retry + 1;

        if (tmp.config.retry <= retriesPerRequest) {
          retryHttpRequest(tmp.config, tmp.deferred);

          // if you do not need to keep track of permanently failed requests remove this
        } else {
          $rootScope.$broadcast('http:error:permanent', {
            config: tmp.config,
            status: tmp.status
          });
        }
      }
    };

    return {
      request: function(config) {
        // modify config before a request is sent

        $rootScope.loading++;

        return config || $q.when(config);
      },

      /*
      requestError: function (rejection) {
        // do something on request error

        return $q.reject(rejection);
      },*/

      response: function(response) {
        // do something on response success

        $rootScope.loading--;

        if (typeof response.config.retries !== 'undefined') {
          $rootScope.$broadcast('http:error:resolved', {
            config: response.config,
            status: response.status
          });
        }

        return response || $q.when(response);
      },

      responseError: function(rejection) {
        // do something on response error

        $rootScope.loading--;
        var deferred = $q.defer();

        buffer.push({
          config: rejection.config,
          deferred: deferred
        });

        if (rejection.status === 401) {
          $location.path('/login');

          return $q.reject(rejection);
        } else if (rejection.status >= 404 ) {
          $rootScope.$broadcast('http:error', {
            config: rejection.config,
            status: rejection.status
          });

          $timeout.cancel( retryTimeout );
          retryTimeout = $timeout( function() {
            retryAll();

          }, retryTimeoutTime);

          // TODO: do we really want to do this??
          return $q.reject(rejection);
        }

        // otherwise: default behaviour
        return $q.reject(rejection);
      },

      clear: function () {
        buffer = [];
      }
    };
  }
})();
