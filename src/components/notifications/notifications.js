(function() {
  'use strict';

  /**
   * MODULE: spam.components.notifications
   * DIRECTIVE: notifications
   * CONTROLLER: NotificationsController
   *
   * Currently this is just a notification about HTTP request/connection
   * errors. Idea here is to expand this into a more general notification
   * system - if required.
   */
  angular
    .module('spam.components.notifications', [
      'lodash',
      'spam.components.app.services.http-intercept'
    ])
    .directive('notifications', notificationsDirective)
    .controller('NotificationsController', notificationsController);




  /* @ngInject */
  function notificationsDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'components/navbar/navbar.html',
      controller: 'NotificationsController',
      controllerAs: 'notifications'
    };
  }




  /* @ngInject */
  function notificationsController(
    $scope,
    _,
    httpIntercept
  ) {
    var ctrl = this;

    var defaultState = {
      error: false,
      permanentError: false,
      status: 201,
      errors: []
    };

    // default http state
    ctrl.http = angular.copy(defaultState);

    /**
     * Listen to the http:error event and update the status appropriately.
     * Will result in a http error message being displayed to the user -
     * the server still retries!
     */
    $scope.$on('http:error', function(event, response) {
      ctrl.http.error = true;
      ctrl.http.status = response.status;

      if (-1 === _.indexOf(ctrl.http.errors, response.config.url)) {
        ctrl.http.errors.push(response.config.url);
      }
    });


    /**
     * Listen to the http:error:resolved event and in result of this maybe hide
     * the http error notice (if all errors have been resolved.)
     */
    $scope.$on('http:error:resolved', function(event, response) {
      // remove the resolved error from the array
      var idx = _.indexOf(ctrl.http.errors, response.config.url);
      if (-1 === idx) {
        ctrl.http.errors = ctrl.http.errors.splice(idx, 1);
      }

      // are all errors resolved?
      if (!ctrl.http.errors.length) {
        ctrl.http.error = false;
        ctrl.http.status = response.status;
      }
    });


    /**
     * Listen to the http:error:permanent event and update the error message appropriately.
     */
    $scope.$on('http:error:permanent', function(event, response) {
      ctrl.http.error = true;
      ctrl.http.permanentError = true;
      ctrl.http.status = response.status;
    });


    /**
     * Resets the http errors and closes the notice.
     */
    ctrl.close = function() {
      httpIntercept.clear();
      ctrl.http = angular.copy(defaultState);
    };
  }

})();
