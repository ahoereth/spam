import angular from 'angular';
import {
  find, flow, filter, get, map, values, flatten, includes, partialRight
} from 'lodash-es';

import userService from '../../user/services/user';


const addRemoveCourseDirective = ['User', User => ({
  restrict: 'E',
  replace: true,
  scope: {
    course: '=course',
    btnClass: '@'
  },
  templateUrl: 'components/courses/add-remove/add-remove.html',
  link: function addRemoveCourseLink(scope) {
    var course = scope.course;
    let rel = {};

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
        .then(course => { rel = course; scope.enrolled = true; })
        .finally(() => { scope.busy = false; });
    };

    // Expose removeCourse method to scope and trigger busy and enrolled
    // state accordingly.
    scope.remove = function() {
      console.log('removing');
      scope.busy = true;
      User.removeCourse(rel)
        .then(() => { scope.enrolled = false; })
        .finally(() => { scope.busy = false; });
    };

    // The fields array might contain all fields from all regulations -
    // we only care about the regulations relevant for the current user.
    scope.fields = filter(course.fields, ({ regulations }) =>
      includes(flatten(map(regulations, values)), scope.user.regulation_id)
    );

    // If there is one or no regulation there is a way to enroll
    // without opening a dropdown.
    scope.singleField = get(scope, 'fields[0].field_id');

    // Find course in current user's transcript to set enrollment state
    // correctly and in order to unenroll from it if required.
    if (User.courses) {
      rel = find(User.courses, { course_id: course.course_id });
      scope.enrolled = !!rel && !!rel.student_in_course_id;
    }
  }
})];


/**
 * MODULE: spam.courses.add-remove
 * DIRECTIVE: addRemoveCourse
 */
export default angular
  .module('spam.courses.add-remove', [userService])
  .directive('addRemoveCourse', addRemoveCourseDirective) // TODO: component
  .name;
