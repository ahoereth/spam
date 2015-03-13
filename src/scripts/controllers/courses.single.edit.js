(function() {
  'use strict';

  /**
   * CONTROLLER: Course_edit
   * ROUTE: /courses/:course_id/edit
   *        /courses/new
   *
   * Course edit page. Users can propose changes to courses and editors
   * can edit/add courses.
   *
   * NOTE: Not used currently. Of interest if SPAM should replace the
   * official course database at some point.
   */
  angular
    .module('spam.controllers.courses')
    .controller('Course_edit', courseEditCtrl);


  /* @ngInject */
  function courseEditCtrl(
    $rootScope,
    $scope,
    $routeParams,
    $location,
    Restangular,
    _
  ) {
    var course;

    var path = $location.path();
    $scope.pageType = (path.substr(path.length - ('/new').length) === '/new') ? 'new' : 'edit';

    // course and fields
    if ($scope.pageType === 'edit') {
      $scope.course = {};
      course = Restangular
        .one('courses', $routeParams.courseId)
        .get({ user: $scope.user.getUsername()})
        .then(function(course) {
          course.id = course.course_id;

          $scope.$emit('title', {
            ':course': course.course + ' ' + course.year
          });

          // init open regulation
          course.regulationExpanded = 0;

          course.teacher_ids = {};
          _.each(course.teachers, function(teacher) {
            this[ teacher.teacher_id ] = true;
          }, course.teacher_ids );

          // handle fields
          var fields = course.fields;
          course.fields = {};
          course.fields_pm = {};

          _.forEach( fields, function(field) {
            this[field.field_id] = true;
            if (field.course_in_field_type === 'PM') {
              course.fields_pm[field.field_id] = true;
            }
          }, course.fields);

          $scope.course = angular.extend($scope.course, course);
        });
    } else {
      $scope.course = {
        term : $rootScope.meta.term,
        year : $rootScope.meta.year,
        language : 'DE',
        teachers : [],
        fields : {},
        fields_pm : {},
        teacher_ids : [],
        regulationExpanded : 0
      };
    }

    // query fields
    Restangular.all('fields').getList().then(function(fields) {
      $scope.fields_in_regulations = _.groupBy(fields, 'regulation');
    });

    // query teachers
    $scope.teachers = Restangular.all('teachers').getList().$object;

    $scope.course.teacher_input = '';
    $scope.$watch('course.teacher_input', function(teacher) {
      if (teacher && teacher.teacher_id) {
        var found = false;
        _.each( $scope.course.teacher_ids, function(v, teacher_id) {
          if (teacher_id === teacher.teacher_id) {
            this[teacher_id] = true;
            found = true;
          }
        }, $scope.course.teacher_ids);

        if (! found) {
          $scope.course.teachers.push({
            teacher_id: teacher.teacher_id,
            teacher   : teacher.teacher
          });
          $scope.course.teacher_ids[ teacher.teacher_id ] = true;
        }
        $scope.course.teacher_input = '';
      }
    });

    $scope.updateCourse = function() {
      if ($scope.pageType === 'edit') {
        $scope.course.put().then(function( course ) {
          $location.path('/courses/'+course.course_id);
        });
      } else if ($scope.pageType === 'new') {
        course.post( $scope.course ).then(function( course ) {
          $location.path('/courses/'+course.course_id);
        });
      }
    };
  }
})();
