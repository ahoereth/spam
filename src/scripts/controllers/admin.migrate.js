(function() {
  'use strict';

  /**
  * CONTROLLER: Admin Migrate
  *
  * Course list migration ikw -> spam.
  */
  angular
    .module('spam.controllers')
    .controller('AdminMigrateController', adminMigrateController);


  /* @ngInject */
  function adminMigrateController(
    $http,
    $location,
    $routeParams,
    Restangular,
    APIURL
  ) {
    var ctrl = this;
    var ikwProvider = APIURL + '/ikw.php';

    var params = $routeParams;
    ctrl.year = parseInt(params.year, 10) || null;
    ctrl.term = params.term || null;

    ctrl.courses = [];

    ctrl.go = function() {
      ctrl.selected = true;
      ctrl.fetching = true;

      params.year = ctrl.year;
      params.term = ctrl.term;
      $location.search(params);

      $http
        .get(ikwProvider, {
          params: {
            year: ctrl.year,
            term: ctrl.term
          }
        })
        .then(function(result) {
          ctrl.fetching = false;
          ctrl.courses =
            Restangular.restangularizeCollection(null, result.data, 'courses');
        });
    };

    ctrl.acceptCourse = function(course) {
      course.accepted = true;
      course.post();
    };

    // init
    if (ctrl.year && ctrl.term) {
      ctrl.go();
    }
  }
})();
