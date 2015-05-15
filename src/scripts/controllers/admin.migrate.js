(function() {
  'use strict';

  /**
  * CONTROLLER: Admin Migrate
  *
  * Course list migration ikw -> spam.
  */
  angular
    .module('spam.controllers')
    .controller('AdminMigrateController', adminMigrateController);


  /* @ngInject */
  function adminMigrateController(
    $location,
    $routeParams,
    Restangular,
    APIURL,
    _
  ) {
    var ctrl = this;
    var ikwProvider = APIURL + '/ikw.php';
    var params = $routeParams;

    ctrl = _.extend(ctrl, {
      year   : parseInt(params.year, 10) || null,
      term   : params.term || null,
      courses: [],
      sieve  : {}
    });

    function fetched(courses) {
      var finders = _.map(courses, function(course, key) {
        return _.extend(_.pick(course, [
          'year',
          'term',
          'code',
          'course',
          'ects',
          'hours',
          'o3_id'
        ]), {key: key});
      });

      Restangular.one('courses', 'find').customPOST(finders).then(function(ids) {
        ctrl.courses = _.map(courses, function(course, key) {
          if (! ids.hasOwnProperty(key)) { return course; }
          return _.extend(course, {course_id: ids[key] });
        });
        ctrl.fetching = false;
      });
    }

    ctrl.fetch = function() {
      ctrl.selected = true;
      ctrl.fetching = true;
      ctrl.courses  = [];

      params.year = ctrl.year;
      params.term = ctrl.term;
      $location.search(params);

      Restangular.allUrl('ikw', ikwProvider).getList({
        year: ctrl.year,
        term: ctrl.term
      }).then(fetched);
    };

    ctrl.acceptCourse = function(course) {
      course.accepted = true;
      course.post();
    };

    // init
    if (ctrl.year && ctrl.term) {
      ctrl.fetch();
    }
  }
})();
