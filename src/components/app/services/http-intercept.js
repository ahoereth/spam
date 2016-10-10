import angular from 'angular';


/**
 * MODULE: spam.app.services.http-intercept
 * SERVICE: httpIntercept
 *
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
const httpInterceptFactory = [
  '$injector', '$rootScope', '$q', '$timeout',
  function httpInterceptFactory($injector, $rootScope, $q, $timeout) {
    $rootScope.loading = 0;
    const retriesPerRequest = 2;
    const retryTimeoutTime = 5000;
    let buffer = [];
    let $http; // Initialized later because of circular dependency problem.
    let retryTimeout;

    // Wrapper for retrying a request.
    const retryHttpRequest = function retryHttpRequest(config, deferred) {
      $http = $http || $injector.get('$http'); // Initialize $http service.
      $http(config).then(
        res => deferred.resolve(res),
        res => deferred.reject(res)
      );
    };

    // Retries all the buffered requests clears the buffer.
    const retryAll = function retryAll() {
      if (buffer.length === 0) { return; }

      let tmp;
      while (tmp = buffer.shift()) { // eslint-disable-line no-cond-assign
        tmp.config.retry = (tmp.config.retry || 0) + 1;
        if (tmp.config.retry <= retriesPerRequest) {
          retryHttpRequest(tmp.config, tmp.deferred);
        } else {
          $rootScope.$broadcast('http:error:permanent', {
            config: tmp.config,
            status: tmp.status,
          });
        }
      }
    };

    return {
      request(config) {
        $rootScope.loading++;
        return config || $q.when(config);
      },

      /*
      requestError: function (rejection) {
        // do something on request error

        return $q.reject(rejection);
      },*/

      response(response) { // success
        $rootScope.loading--;
        if (typeof response.config.retries !== 'undefined') {
          $rootScope.$broadcast('http:error:resolved', {
            config: response.config,
            status: response.status,
          });
        }
        return response || $q.when(response);
      },

      responseError(rejection) { // error
        $rootScope.loading--;
        buffer.push({ deferred: $q.defer(), config: rejection.config });
        if (rejection.status === 401 || rejection.status === 403) {
          // No redirection here because we might try to authenticate the user
          // even for routes for which which not necessarily require auth.
          // $location.path('/login');
          return $q.reject(rejection);
        } else if (rejection.status >= 404) {
          $rootScope.$broadcast('http:error', {
            config: rejection.config,
            status: rejection.status,
          });
          $timeout.cancel(retryTimeout);
          retryTimeout = $timeout(() => retryAll(), retryTimeoutTime);
          return $q.reject(rejection);
        }
        return $q.reject(rejection);
      },

      clear() {
        buffer = [];
      },
    };
  },
];


export default angular
  .module('spam.app.services.http-intercept', [])
  .factory('httpIntercept', httpInterceptFactory)
  .name;
