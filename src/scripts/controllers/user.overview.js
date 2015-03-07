(function() {
  'use strict';

  /**
   * CONTROLLER: Home
   * ROUTE: /~
   *
   * TODO: this needs massive cleanup and optimization
   */
  angular
    .module('spam.controllers.user')
    .controller('Home', userOverviewCtrl);


  /* @ngInject */
  function userOverviewCtrl(
    $scope,
    Restangular,
    User,
    $timeout
  ) {
    function scopeApply() { $scope.$apply(); }
    User.addWatcher(scopeApply);

    $scope.facts   = User.facts;
    $scope.fields  = User.fields;
    $scope.courses = User.courses;

    $scope.thesis = {
      title: User.details.thesis.title,
      grade: User.details.thesis.grade,
      active: !! (User.details.thesis_title || User.details.thesis_grade)
    };

    $scope.thesisChange = function() {
      if (User.details.thesis.title === $scope.thesis.title &&
          User.details.thesis.grade === $scope.thesis.grade
      ) { return; }

      $scope.thesis = angular.extend(
        $scope.thesis,
        User.updateThesis($scope.thesis.title, $scope.thesis.grade)
      );
    };


    /**
     * Function to give the user a headstart and add the guide courses for his
     * first semester.
     */
    $scope.headstart = function() {
      Restangular.one('guides', 1).getList('courses', {
        semester: 1,
        year    : $scope.user.mat_year,
        term    : $scope.user.mat_term
      }).then(function(guide) {
        angular.forEach(guide, function(course) {
          $scope.addCourse(course.course_id, course.fields[0].field_id);
        });
      });
    };
  }

})();
