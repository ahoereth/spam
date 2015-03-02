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
    $rootScope,
    $scope,
    $timeout,
    $route,
    $cacheFactory,
    $location,
    $log,
    $q,
    _,
    Restangular,
    Transcript,
    User
  ) {
    var scopeApply = function() {
      $scope.$apply();
    };

    User.addWatcher(scopeApply);
    $scope.facts    = User.facts;
    $scope.fields   = User.fields;
    $scope.courses  = User.courses;
    $scope.username = User.username;


    /**
     * TODO: needs to be refactored
     */
    $scope.updateThesis = function() {
      var user = $scope.user;
      user.thesis_grade = _.formatGrade(user.thesis_grade);

      if (user.thesis_title_old === user.thesis_title &&
          user.thesis_grade_old === user.thesis_grade) {
        return;
      }

      Transcript.facts_changed();

      // remember old stuff
      user.thesis_title_old = user.thesis_title;
      user.thesis_grade_old = user.thesis_grade;

      $scope.user.one('regulations', user.regulation_id).customPUT({
        title: user.thesis_title,
        grade: user.thesis_grade
      }).then(function() {
        $log.info('Student thesis updated: ' + user.thesis_title + ' - ' + user.thesis_grade);
      });
    };
    $scope.thesis_active = $scope.user.thesis_title || $scope.user.thesis_grade ? true : false;


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
        _.each(guide, function(course) {
          $scope.addCourse(course.course_id, course.fields[0].field_id);
        });
      });
    };


    /**
     * Moves a specific course to a different field. Student in course data.
     *
     * TODO: move to course directive
     */
  /*  $scope.moveCourse = function(newFieldId) {
      var c = this.course;
      var target = _.findWhere($scope.user.courses, {
        student_in_course_id: c.student_in_course_id
      });
      target.enrolled_field_id = (! _.isNull(newFieldId)) ? newFieldId : 1;
      $scope.editProp(target);
    };*/
  }

})();
