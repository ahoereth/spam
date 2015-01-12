(function() {
  'use strict';

  /**
   * CONTROLLER: Course_proposals
   * ROUTE: /admin/proposals
   *
   * Displays a list of all pending course proposals to editors.
   */
  angular
    .module('spam.controllers.courses')
    .controller('Course_proposals', coursesProposalsCtrl);


  /* @ngInject */
  function coursesProposalsCtrl(
    $rootScope,
    $scope,
    $location,
    $routeParams,
    $log,
    _,
    Restangular
  ) {
    fetch();

    $scope.acceptProposal = function(course) {
      course.id = course.course_id;

      course.put().then(function() {
        $log.info('Proposed change accepted: ' + course.course_id + ' - ' + course.course);
        fetch();
      });
    };

    $scope.dismissProposal = function(course) {
      course.id = course.course_id;

      course.remove().then(function() {
        $log.info('Proposed change dismissed: ' + course.course_id + ' - ' + course.course);
        fetch();
      });
    };

    function fetch() {
      $scope.loading.courses = true;
      $scope.courses = Restangular.all('courses').all('preliminaries').getList().$object;
    }
  }
})();
