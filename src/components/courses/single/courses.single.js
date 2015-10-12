(function() {
  'use strict';

  /**
   * MODULE: spam.components.courses.single
   * CONTROLLER: CoursesSingleController
   * ROUTE: /courses/:course_id
   */
  angular
    .module('spam.components.courses.single', [])
    .config(coursesSingleRouting)
    .controller('CoursesSingleController', coursesSingleController);




  /* @ngInject */
  function coursesSingleRouting($routeProvider) {
    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
        return Auth.authenticate($route.current.access);
      }
    };

    $routeProvider.when('/courses/:courseId', {
      templateUrl: 'components/courses/single/courses.single.html',
      controller: 'CoursesSingleController',
      //controllerAs: 'course',
      title: ':course',
      access: 0,
      resolve: auth
    });
  }




  /* @ngInject */
  function coursesSingleController(
    $scope,
    $routeParams,
    Restangular,
    User,
    _
  ) {
    Restangular
      .one('courses', $routeParams.courseId)
      .get({ user: _.get(User, 'details.username', undefined) })
      .then(function(course) {
        $scope.course = course;
        course.fields_by_regulations = {};

        _.forEach(course.fields, function(field) {
          _.forEach(field.regulations, function(regulation) {
            if (_.isUndefined(course.fields_by_regulations[regulation.regulation])) {
              course.fields_by_regulations[regulation.regulation] = [];
            }

            // generate links
            var fieldclone = angular.copy(field);
            fieldclone.search =
              'courses?regulation=' + regulation.regulation_id +
              '&field=' + fieldclone.field;
            fieldclone.searchpm = fieldclone.search + '&pm';
            course.fields_by_regulations[regulation.regulation].push(fieldclone);
          });
        });

        // refresh page title
        $scope.$emit('title', {':course': course.course + ' ' + course.year});
      });
  }
})();
