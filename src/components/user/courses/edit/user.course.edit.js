(function() {
  'use strict';

  /**
   * MODULE: spam.user.course.edit
   * ROUTES:
   *   /~/courses/new
   *   /~/courses/:course_id (TODO)
   * CONTROLLER: UserCourseEditController
   */
  angular
    .module('spam.user.course.edit', [
      'restangular',
      'instafocus',
      'lodash',
      'iifFilter',
      'spam.app.services.routes',
      'spam.user.services.user'
    ])
    .config(userCourseEditRouting)
    .controller('UserCourseEditController', userCourseEditController);




  /* @ngInject */
  function userCourseEditRouting(RoutesProvider) {
    RoutesProvider.add('/~/courses/new', {
      controller: 'UserCourseEditController',
      controllerAs: 'edit',
      templateUrl: 'components/user/courses/edit/user.course.edit.html',
      title: 'Add unofficial course',
      access: 1
    });

    RoutesProvider.add('/~/courses/edit/:student_in_course_id', {
      controller: 'UserCourseEditController',
      controllerAs: 'edit',
      templateUrl: 'components/user/courses/edit/user.course.edit.html',
      title: 'Edit personal course',
      access: 1
    });

    RoutesProvider.add('/~/courses/edit', {
      redirectTo: '/~/courses/new'
    });
  }




  /* @ngInject */
  function userCourseEditController(
    $location,
    $routeParams,
    Restangular,
    User,
    _
  ) {
    var ctrl = this;
    ctrl.course = {};
    ctrl.page = $routeParams.student_in_course_id ? 'edit' : 'new';

    ctrl.fields = Restangular.all('fields').getList({
      regulation_id: User.details.regulation_id
    }).$object;

    var d = new Date(), m = d.getMonth(), y = d.getFullYear();
    var currentTermYear = (m > 3) ? y : y - 1;
    var currentTerm = (m > 8 || m < 3) ? 'W' : 'S';
    ctrl.year = currentTermYear;

    if ('edit' === ctrl.page) {
      // edit course
      var id = parseInt($routeParams.student_in_course_id, 10);
      User.details.one('courses', id).get().then(function(c) {
        // No edits allowed for official courses yet.
        if (c.course_id) {
          $location.path('/~/courses/new');
          return false;
        }
        ctrl.course = c;
      }, function() {
        // Course does not exist, redirect.
        $location.path('/~/courses/new');
      });
    } else {
      // new course
      var fieldId = $routeParams.fieldId ?
        parseInt($routeParams.field_id, 10) : 1;
      ctrl.course = {
        enrolled_field_id: fieldId,
        year: currentTermYear,
        term: currentTerm
      };
    }

    /**
     * Adds the form data as unofficial course to the user's course collection.
     */
    ctrl.submit = function() {
      ctrl.submitted = true;
      var course = this.course || {};

      // The course needs to be located in some semester and some field.
      _.defaults(course, {
        year: currentTermYear,
        term: currentTerm,
        field_id: 1
      });

      // Can't submit if the course has no title.
      if (_.isEmpty(course.course)) {
        ctrl.submitted = false;
        return;
      }

      if (course.restangularized) {
        // Update existing course.
        course.save().then(function(refreshedCourse) {
          User.refreshCourse(refreshedCourse).then(function() {
            $location.search({}).path('/~');
          });
        });
      } else {
        // Add and redirect.
        User.addCourse(course).then(function() {
          ctrl.submitted = false;
          $location.search({}).path('/~');
        });
      }
    };
  }

})();
