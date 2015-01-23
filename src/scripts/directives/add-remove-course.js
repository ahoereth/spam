(function() {
  'use strict';

  /**
   * DIRECTIVE: addRemoveCourse
   */
  angular
    .module('spam.directives')
    .directive('addRemoveCourse', addRemoveCourseDirective);


  /* @ngInject */
  function addRemoveCourseDirective(_) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        course: '=course',
        btnClass: '@',
        addCourse: '=',
        removeCourse: '='
      },
      templateUrl: 'partials/directives/add-remove-course.html',
      /* @ngInject */
      controller: function($rootScope, $scope) {
        var course = $scope.course;

        // check if user is enrolled in this course
        if (! _.isEmpty($rootScope.user.courses) && _.isUndefined(course.enrolled)) {
          var target = _.find($rootScope.user.courses, {course_id: course.course_id});
          course.enrolled = target ? true : false;
        }
      }
    };
  }

})();
