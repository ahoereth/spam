(function() {
  'use strict';

  /**
   * MODULE: spam.components.user.course.edit
   * ROUTES:
   *   /~/courses/new
   *   /~/courses/:course_id (TODO)
   * CONTROLLER: UserCourseEditController
   */
  angular
    .module('spam.components.user.course.edit', [
      'instafocus',
      'spam.services',
      'spam.components.app.services.routes'
    ])
    .config(userCourseEditRouting)
    .controller('UserCourseEditController', userCourseEditController);




  /* @ngInject */
  function userCourseEditRouting(RoutesProvider) {
    RoutesProvider.add('/~/courses/new', {
      controller: 'UserCourseEditController',
      templateUrl: 'components/user/courses/new/user.course.edit.html',
      title: 'Add unofficial Course',
      access: 1
    });

    /*RoutesProvider.add('/~/courses/edit/:course_id', {
      controller: 'UserCourseEditController',
      templateUrl: 'components/user/courses/new/user.course.edit.html',
      title: 'Edit personal course',
      access: 1
    });*/
  }




  /* @ngInject */
  function userCourseEditController(
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
