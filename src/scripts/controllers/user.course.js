(function() {
  'use strict';

  angular
    .module('spam.controllers.user')
    .controller('UnofficialCourseEditCtrl', nofficialCourseEditCtrl);


  /* @ngInject */
  function nofficialCourseEditCtrl(
    $rootScope,
    $scope,
    $location,
    $routeParams,
    Restangular,
    User,
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
     * Adds the form data as unofficial course to the user's course collection.
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
        $scope.submitted = false;
        return;
      }

      // Add and redirect.
      User.addCourse(course).then(function() {
        $scope.submitted = false;
        $location.search({}).path('/~');
      });
    };
  }

})();
