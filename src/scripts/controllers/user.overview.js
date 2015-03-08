(function() {
  'use strict';

  /**
   * CONTROLLER: Home
   * ROUTE: /~
   */
  angular
    .module('spam.controllers.user')
    .controller('HomeCtrl', userOverviewCtrl);


  /* @ngInject */
  function userOverviewCtrl(
    $scope,
    Restangular,
    User
  ) {
    /**
     * Forces a local $scope.$apply - used in cases where changes occur out
     * of the regular cycle.
     */
    function scopeApply() {
      $scope.$apply();
    }


    /**
     * Called when any of the thesis details (title or grade) change. Updates
     * the User data.
     */
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
     * first semester to his personal overview.
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


    // Forces a $scope.$apply when relevant user data changes out-of-cycle.
    User.addWatcher(scopeApply);

    // Initialize local scope data.
    $scope.facts   = User.facts;
    $scope.fields  = User.fields;
    $scope.courses = User.courses;
    $scope.thesis  = {
      title :     User.details.thesis.title,
      grade :     User.details.thesis.grade,
      active: !! (User.details.thesis.title ||
                  User.details.thesis.grade)
    };
  }

})();
