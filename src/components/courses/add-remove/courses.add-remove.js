(function() {
  'use strict';

  /**
   * MODULE: spam.components.courses.add-remove
   * DIRECTIVE: addRemoveCourse
   *
   * TODO: move to courses module
   */
  angular
    .module('spam.components.courses.add-remove', [
      'lodash',
      'spam.components.user.services.user'
    ])
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
      templateUrl: 'components/courses/add-remove/courses.add-remove.html',
      link: function(scope) {
        var course = scope.course;
        var rel = {};

        // Expose relevant user variables to scope.
        function userConstruct(event, user) {
          scope.user = {
            loggedin: !!user,
            regulation_id: user && user.regulation_id
          };
        }
        userConstruct(undefined, User.details || undefined);

        // Add remove buttons are not required for not loggedin users.
        if (! scope.user.loggedin) {
          return false;
        }

        // Watch for user changes.
        scope.$on('user-construct', userConstruct);

        // Expose addCourse method to scope and trigger busy and enrolled
        // state accordingly.
        scope.add = function(fieldId) {
          scope.busy = true;
          User.addCourse(course.course_id, fieldId)
            .then(function() { scope.enrolled = true; })
            .finally(function() { scope.busy = false; });
        };

        // Expose removeCourse method to scope and trigger busy and enrolled
        // state accordingly.
        scope.remove = function() {
          scope.busy = true;
          User.removeCourse(rel)
            .then(function() { scope.enrolled = false; })
            .finally(function() { scope.busy = false; });
        };

        // The fields array might contain all fields from all regulations -
        // we only care about the regulations relevant for the current user.
        scope.fields = _.filter(course.fields, function(field) {
          return _(field.regulations)
            .map(_.values).flatten()
            .contains(scope.user.regulation_id);
        });

        // If there is one or no regulation there is a way to enroll
        // without opening a dropdown.
        scope.singleField = _.get(scope, 'fields[0].field_id', null);

        // Find course in current user's transcript to set enrollment state
        // correctly and in order to unenroll from it if required.
        if (User.courses) {
          rel = _.findWhere(User.courses, {
            course_id: course.course_id
          });

          // Check if user is enrolled in this course.
          scope.enrolled = !! rel && !! rel.student_in_course_id;
        }
      }
    };
  }

})();
