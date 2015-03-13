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
        var rel = {};

        // Expose add and remove course functionality to scope.
        scope.add = function(fieldId) {
          scope.busy = true;
          User.addCourse(scope.course.course_id, fieldId)
            .then(function() { scope.enrolled = true; })
            .finally(function() { scope.busy = false; });
        };

        scope.remove = function() {
          scope.busy = true;
          User.removeCourse(rel)
            .then(function() { scope.enrolled = false; })
            .finally(function() { scope.busy = false; });
        };

        if (User.courses) {
          rel = _.findWhere(User.courses, {
            course_id: scope.course.course_id
          });

          // check if user is enrolled in this course
          scope.enrolled = !! rel && !! rel.student_in_course_id;
        }
      }
    };
  }

})();
