(function() {
  'use strict';

  /**
  * CONTROLLER: Alert
  *
  * Every div can be an alert - basically a div with a close button.
  */
  angular
    .module('spam.controllers')
    .controller('Alert', alertCtrl);


  /* @ngInject */
  function alertCtrl($scope) {
    /**
     * Hides the alert
     */
    $scope.closeAlert = function () {
      this.$parent.alert = false;
    };
  }
})();
