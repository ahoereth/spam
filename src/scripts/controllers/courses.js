(function() {
  'use strict';

  /**
   * CONTROLLER: Courses
   * ROUTE: /courses
   *
   * Courses index.
   */
  angular
    .module('spam.controllers.courses')
    .controller('Courses', coursesCtrl);


  /* @ngInject */
  function coursesCtrl(
    $rootScope,
    $scope,
    $location,
    $routeParams,
    $filter,
    $q,
    Restangular,
    _,
    Courses
  ) {
    var url = {},
        lowerYear = $rootScope.meta.year-1,
        upperYear = $rootScope.meta.year+1,
        courses = [],
        fetching = false,
        originalDisplayLimit = 25;

    _.extend($scope, {
      coursesPerFetch : 100,
      courseSelected : 0,
      fetchNoMore : false,
      displayLimit : 25,
      filter : {},
      filteredCourses : [],
      orderBys: {
        code:        ['code','-year','-term', 'course'],
        '-code':     ['-code','-year','-term', 'course'],
        course:      ['course','-year','-term'],
        '-course':   ['-course','-year','-term'],
        teachers:    ['teachers_str','-year','-term', 'course'],
        '-teachers': ['-teachers_str','-year','-term', 'course'],
        fields:      ['fields_str','-year','-term', 'course'],
        '-fields':   ['-fields_str','-year','-term', 'course'],
        time:        ['year','-term', 'course'],
        '-time':     ['-year', '-term', 'course']
      },
    });
    $scope.order = $scope.orderBys['-time'];


    /**
     * Watches the general filter object. Contains the code, title, teachers and
     * field of study input fields.
     */
    $scope.$watch('filter', function(next, current) {
      if (next === current) { return; }

      applyFilter();
      refreshUrl();
    }, true);


    /**
     * Watches the "obligatory module" checkbox.
     */
    $scope.$watch('pm', function(next, current) {
      if (_.isUndefined(next) || next === current) { return; }

      if (next) {
        $scope.filter['fields_str#~'] = '(PM)';
      } else {
        delete $scope.filter['fields_str#~'];
        refreshUrl(); // delete does not trigger the filter watch
      }
    });


    /**
    * Watches the timeframe input field.
     */
    $scope.$watch('timeframe', function(next, current) {
      if (_.isUndefined(next) || next === current) { return; }

      refreshUrl(); // delete does not trigger the filter watch
    });


    /**
     * Is triggered when the user changes the regulation input field.
     */
    $scope.$watch('regulation_id', function(next, current) {
      if (_.isUndefined(next) || next === current) { return; }

      $scope.displayLimit = originalDisplayLimit;
      lowerYear = $rootScope.meta.year-1;

      $scope.filteredCourses = [];
      applyFilter(true);
      refreshUrl();
    });


    /**
     * Called when user explicitly clicks the "show more courses" button. This
     * won't be used in most cases because of infinite scrolling.
     */
    $scope.scrollOn = function(amount) {
      if ($scope.displayLimit < $scope.filteredCourses.length) {
        $scope.displayLimit += _.isUndefined(amount) ? originalDisplayLimit : amount;
      }

      if ($scope.displayLimit > ($scope.filteredCourses.length - 50)) {
        applyFilter(true);
      }
    };


    $scope.orderBy = function(order) {
      $scope.order = ($scope.order === $scope.orderBys[order]) ?
        $scope.orderBys['-' + order] :
        $scope.orderBys[order];

      lowerYear = lowerYear <= 1995 ? lowerYear - 1 : 1995;
      applyFilter(true, true);
    };


    /**
     * Extract the url parameters for use in a search query.
     */
    var fetchParams = function () {
      var params = $routeParams;

      $scope.filter = {
        code: params.code,
        course: params.course,
        teachers_str: params.teacher,
        fields_str: params.field,
        'fields_str#~': params.pm ? '(PM)' : null
      };

      if (! _.isUndefined(params.timeframe)) {
        $scope.timeframe = params.timeframe;

        params.timeframe = params.timeframe.toLowerCase();
        if (params.timeframe.charAt(0) === 'w' || params.timeframe.charAt(0) === 's') {
          $scope.filter['term#='] = params.timeframe.charAt(0);
          params.timeframe = params.timeframe.slice(1);
        }

        var pattern = /(?:^(?:20)?(\d{2})$)|(?:(?:20)?(\d{2})([+-])(?:(?:20)?(\d{2}))?)|(?:([WS])S?(?:20)?(\d{2}))|([WS])/i;
        var r = _.compact(pattern.exec(_.trim(params.timeframe)));

        if (! _.isEmpty(r)) {
          if (_.isEmpty(r[2])) {
            $scope.filter['year#='] = '20' + r[1];
          } else if (r[2] === '+') {
            // year lower limit
            $scope.filter['year#<'] = '20' + r[1];

          } else if (r[2] === '-') {
            if (! _.isEmpty(r[3])) {
              // years range
              $scope.filter['year#<'] = '20' + r[1];
              $scope.filter['year#>'] = '20' + r[3];

            } else {
              // year upper limit
              $scope.filter['year#>'] = '20' + r[1];

            }
          }
        }
      }

      $scope.filter = _.compactObject($scope.filter);
      $scope.regulation_id = params.regulation ? parseInt(params.regulation, 10) : '';
    };


    /**
     * Updates all URL parameters using the information from the current filters.
     */
    var refreshUrl = function() {
      var filter = $scope.filter;
      url = {
        regulation : $scope.regulation_id,
        timeframe : $scope.timeframe,
        code : filter.code,
        course : filter.course,
        teacher : filter.teachers_str,
        field : filter.fields_str,
        pm : filter['fields_str#~'] ? true : false
      };
      url = _.compactObject(url);
      $location.search(url);
    };


    /**
     * Watch for route updates and refetch the course list if required
     */
    $scope.$on('$routeUpdate', function(event, route) {
      if (route.params === url) { return; }
      fetchParams();
    });


    /**
     * Refreshes des course list with the new filters applied.
     *
     * TODO: unify with navbar.js
     */
    var applyFilter = function(justFetch, force) {
      if (! justFetch) {
        $scope.filteredCourses = $filter('courseFilter')(courses, $scope.filter);
      }

      if (lowerYear < 1995 || fetching) { return; }

      if ($scope.displayLimit > ( $scope.filteredCourses.length - 5 ) || force) {
        fetching = true;

        Courses
          .fetch($scope.regulation_id, lowerYear, upperYear, null)
          .then(function(newCourses) {
            courses = newCourses;
            fetching = false;
            applyFilter();
          });
        lowerYear = lowerYear - 3;
      }
    };


    // get all regulations
    Restangular
      .all('regulations')
      .getList()
      .then(function(regulations) {
        var t = _.findWhere( regulations, { regulation_id : 4 } );
        $scope.regulations = _.without( regulations, t );

        $scope.regulations.unshift({
          regulation_id : '',
          regulation: 'All courses'
        });
        fetchParams();
      });
  }
})();
