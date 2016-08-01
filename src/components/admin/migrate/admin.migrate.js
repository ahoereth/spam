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
    var d = new Date(), m = d.getMonth(), y = d.getFullYear();

    _.assign(ctrl, {
      year   : parseInt(params.year, 10) || (m < 5) ? y : y + 1,
      term   : params.term || (m > 11 || m < 5) ? 'S' : 'W',
      courses: [],
      sieve  : {}
    });


    /**
     * Check the SPAM API for whether courses retrieved from the custom IKW o2
     * API already exist.
     *
     * @param {array} courses Array of raw courses from the foreign API.
     */
    function fetched(courses) {
      var finders = _.map(courses, function(course, key) {
        return _.assignIn(_.pick(course, [
          'year',
          'term',
          'code',
          'course',
          'ects',
          'hours',
          'o3_id'
        ]), { key: key });
      });

      Restangular.one('courses', 'find').customPOST(finders).then(function(ids) {
        courses = _.map(courses, function(course, key) {
          if (!ids.hasOwnProperty(key)) { return course; }
          return _.assignIn(course, { course_id: ids[key] });
        });

        ctrl.fetching = false;
        ctrl.courses = Restangular.restangularizeCollection(
          null, courses, 'courses'
        );
      });
    }


    /**
     * Fetch courses from the custom IKW o2 API.
     */
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


    /**
     * Accepts a o2 course and posts it to the SPAM API.
     *
     * @param  {course} course Course to accept.
     */
    ctrl.acceptCourse = function(course) {
      course.accepted = true;
      course.post();
    };
  }

})();
