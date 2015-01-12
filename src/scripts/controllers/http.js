(function() {
  'use strict';


 /**
   * CONTROLLER: HttpNotice
   *
   * A warning prominently displayed below the navbar when there is a
   * connection problem.
   */
  angular
    .module('spam.controllers')
    .controller('HttpNotice', httpNoticeCtrl);


  /* @ngInject */
  function httpNoticeCtrl(
    $scope,
    $rootScope,
    _,
    httpIntercept
  ) {
    var defaultState = {
      error: false,
      permanentError: false,
      status: 201,
      errors: []
    };

    // default http state
    $rootScope.http = angular.copy(defaultState);

    /**
     * Listen to the http:error event and update the status appropriately.
     * Will result in a http error message being displayed to the user -
     * the server still retries!
     */
    $scope.$on('http:error', function(event, response) {
      $rootScope.http.error = true;
      $rootScope.http.status = response.status;

      if (-1 === _.indexOf($rootScope.http.errors, response.config.url)) {
        $rootScope.http.errors.push(response.config.url);
      }
    });


    /**
     * Listen to the http:error:resolved event and in result of this maybe hide
     * the http error notice (if all errors have been resolved.)
     */
    $scope.$on('http:error:resolved', function(event, response) {
      // remove the resolved error from the array
      var idx = _.indexOf($rootScope.http.errors, response.config.url);
      if (-1 === idx) {
        $rootScope.http.errors = $rootScope.http.errors.splice(idx, 1);
      }

      // are all errors resolved?
      if (! $rootScope.http.errors.length) {
        $rootScope.http.error = false;
        $rootScope.http.status = response.status;
      }
    });


    /**
     * Listen to the http:error:permanent event and update the error message appropriately.
     */
    $scope.$on('http:error:permanent', function(event, response) {
      $rootScope.http.error = true;
      $rootScope.http.permanentError = true;
      $rootScope.http.status = response.status;
    });


    /**
     * Resets the http errors and closes the notice.
     */
    $scope.close = function() {
      httpIntercept.clear();
      $rootScope.http = angular.copy(defaultState);
    };
  }
})();
