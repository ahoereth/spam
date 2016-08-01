(function() {
  'use strict';

  /**
   * MODULE: spam.admin.migrate
   * ROUTE: /admin/migrate
   * CONTROLLER: AdminMigrateController
   */
  angular
    .module('spam.admin.migrate', [
      'restangular',
      'lodash',
      'instafocus',
      'inlineSelectables',
      'buttons',
      'yearFilter',
      'spam.courses.row',
      'spam.app.constants',
      'spam.app.services.routes'
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
    _,
    APIURL,
    O2URL
  ) {
    var ctrl = this;
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

      Restangular.allUrl('o2', O2URL).getList({
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
