(function() {
  'use strict';

  /**
   * DIRECTIVE: addRemoveCourse
   */
  angular
    .module('spam.directives')
    .directive('addRemoveCourse', addRemoveCourseDirective);


  /* @ngInject */
  function addRemoveCourseDirective(User, _) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        course: '=course',
        btnClass: '@'
      },
      templateUrl: 'partials/directives/add-remove-course.html',
      link: function(scope) {
        // Expose add and remove course functionality to scope.
        scope.add = function(fieldId) {
          scope.busy = true;
          User.addCourse(scope.course.course_id, fieldId).then(
            function() { scope.enrolled = true;  },
            function() { scope.enrolled = false; }
          ).finally(function() { scope.busy = false; });
        };

        scope.remove = function() {
          scope.busy = true;
          User.removeCourse(scope.course.course_id).then(
            function() { scope.enrolled = false;  },
            function() { scope.enrolled = true; }
          ).finally(function() { scope.busy = false; });
        };

        // check if user is enrolled in this course
        scope.enrolled =
          !  _.isEmpty(User.courses) &&
          !! _.findWhere(User.courses, {course_id: scope.course.course_id});
      }
    };
  }

})();
