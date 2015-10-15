(function() {
  'use strict';

  /**
   * MODULE: spam.components.admin.migrate
   * ROUTE: /admin/migrate
   * CONTROLLER: AdminMigrateController
   */
  angular
    .module('spam.components.admin.migrate', [
      'instafocus',
      'inlineSelectables',
      'mgcrea.ngStrap.button',
      'spam.components.common.courserow',
      'spam.components.app.services.routes'
    ])
    .config(adminMigrateRouting)
    .controller('AdminMigrateController', adminMigrateController);




  /* @ngInject */
  function adminMigrateRouting(RoutesProvider) {
    RoutesProvider.add('/admin/migrate', {
      controller: 'AdminMigrateController',
      controllerAs: 'migrate',
      templateUrl: 'components/admin/migrate/admin.migrate.html',
      title: 'IKW DB Migration',
      reloadOnSearch: false,
      access: 32
    });
  }




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
        courses = _.map(courses, function(course, key) {
          if (! ids.hasOwnProperty(key)) { return course; }
          return _.extend(course, {course_id: ids[key] });
        });

        ctrl.fetching = false;
        ctrl.courses = Restangular.restangularizeCollection(
          null, courses, 'courses'
        );
      });
    }

    ctrl.fetch = _.debounce(function() {
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
    }, 500);

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
