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
      'ngRoute',
      'instafocus',
      'spam.services'
    ])
    .config(userCourseEditRouting)
    .controller('UserCourseEditController', userCourseEditController);




  /* @ngInject */
  function userCourseEditRouting($routeProvider) {
    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
       return Auth.authenticate($route.current.access);
      }
    };

    $routeProvider.when('/~/courses/new', {
      templateUrl: 'components/user/courses/new/user.course.edit.html',
      controller: 'UserCourseEditController',
      access: 1,
      title: 'Add unofficial Course',
      resolve: auth
    });

    /*$routeProvider.when('/~/courses/edit/:course_id', {
      templateUrl: 'components/user/courses/new/user.course.edit.html',
      controller: 'UserCourseEditController',
      access: 1,
      title: 'Edit personal course',
      resolve: auth
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
