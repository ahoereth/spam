(function() {
  'use strict';

  angular
    .module('spam.controllers.user')
    .controller('Unofficial_edit', userCourseCtrl);


  /* @ngInject */
  function userCourseCtrl(
    $rootScope,
    $scope,
    $location,
    $routeParams,
    Restangular,
    _
  ) {
    $scope.fields = Restangular.all('fields').getList({
      regulation_id: $scope.user.regulation_id
    }).$object;

    $scope.course = {
      field_id: parseInt($routeParams.field_id, 10),
      unofficial_year: $rootScope.meta.currentTermYear,
      unofficial_term: $rootScope.meta.term
    };

    /**
     * Adds an unofficial course to the user's course collection.
     *
     * @param course object
     *     unofficial_code
     *     unofficial_course
     *     unofficial_ects
     *     unofficial_semester
     */
    $scope.submit = function() {
      $scope.submitted = true;
      var course = this.course || {};

      // The course needs to be located in some semester. If none is defined
      // add it to the current.
      _.defaults(course, {
        unofficial_year: $rootScope.meta.currentTermYear,
        unofficial_term: $rootScope.meta.term
      });

      // Can't submit if the course has no title.
      if (_.isEmpty(course.unofficial_course)) {
        return;
      }

      $scope.addCourse(course);

      // When the course is added redirect to the course overview.
      var added = $scope.$on('courseAdded', function() {
        $scope.submitted = false;
        $location.search({}).path('/~');

        added();
      });
    };
  }

})();
