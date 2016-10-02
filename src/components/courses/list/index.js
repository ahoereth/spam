import angular from 'angular';
import ngRoute from 'angular-route';
import {
  extend, isUndefined, compact, trim, isEmpty, get, find, without, pickBy
} from 'lodash-es';

import iif from '../../lib/iif';
import scroll from '../../lib/scroll';
import infiniteScroll from '../../lib/infinite-scroll';
import buttons from '../../lib/buttons';
import tooltips from '../../lib/tooltips';
import restangular from '../../lib/restangular';
import routes from '../../app/services/routes';
import coursesService from '../services/courses';
import courseFilter from '../filters/course';
import courseSingle from '../single';
import row from '../row';

// import './courses.list.css';


/**
 * MODULE: spam.courses.list
 * CONTROLLER: CoursesIndexController
 * ROUTE: /courses
 */
export default angular
  .module('spam.courses.list', [
    ngRoute, // $routeParams
    restangular,
    tooltips,
    iif,
    scroll,
    infiniteScroll,
    buttons,
    routes,
    coursesService,
    courseFilter,
    courseSingle,
    row
  ])
  .config(coursesIndexRouting)
  .controller('CoursesIndexController', coursesIndexController)
  .name;




/* @ngInject */
function coursesIndexRouting(RoutesProvider) {
  RoutesProvider.add('/courses', {
    controller: 'CoursesIndexController',
    //controllerAs: 'index',
    templateUrl: 'components/courses/list/courses.list.html',
    title: 'Courses',
    reloadOnSearch: false
  });
}




/* @ngInject */
function coursesIndexController(
  $rootScope,
  $scope,
  $location,
  $routeParams,
  $filter,
  $q,
  Restangular,
  _,
  Scroll,
  Courses
) {
  var url = {};
  var year = new Date().getFullYear();
  var lowerYear = year;
  var upperYear = year + 1;
  var courses = [];
  var fetching = false;
  var originalDisplayLimit = 25;

  extend($scope, {
    coursesPerFetch : 100,
    courseSelected : 0,
    fetchNoMore : false,
    displayLimit : 25,
    filter : {},
    filteredCourses : [],
    textModelOptions: {updateOn: 'default blur', debounce: {'default': 200, 'blur': 0}},
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
    if (isUndefined(next) || next === current) { return; }

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
    if (isUndefined(next) || next === current) { return; }

    refreshUrl(); // delete does not trigger the filter watch
  });


  /**
   * Is triggered when the user changes the regulation input field.
   */
  $scope.$watch('regulation_id', function(next, current) {
    if (isUndefined(next) || next === current) { return; }

    $scope.displayLimit = originalDisplayLimit;
    lowerYear = year - 1;

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
      $scope.displayLimit += isUndefined(amount) ? originalDisplayLimit : amount;
    }

    if ($scope.displayLimit > ($scope.filteredCourses.length - 50)) {
      applyFilter(true);
    }
  };


  $scope.orderBy = function(order) {
    $scope.order = ($scope.order === $scope.orderBys[order]) ?
      $scope.orderBys['-' + order] :
      $scope.orderBys[order];

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

    if (! isUndefined(params.timeframe)) {
      $scope.timeframe = params.timeframe;

      params.timeframe = params.timeframe.toLowerCase();
      if (params.timeframe.charAt(0) === 'w' || params.timeframe.charAt(0) === 's') {
        $scope.filter['term#='] = params.timeframe.charAt(0);
        params.timeframe = params.timeframe.slice(1);
      }

      var pattern = /(?:^(?:20)?(\d{2})$)|(?:(?:20)?(\d{2})([+-])(?:(?:20)?(\d{2}))?)|(?:([WS])S?(?:20)?(\d{2}))|([WS])/i;
      var r = compact(pattern.exec(trim(params.timeframe)));

      if (! isEmpty(r)) {
        if (isEmpty(r[2])) {
          $scope.filter['year#='] = '20' + r[1];
        } else if (r[2] === '+') {
          // year lower limit
          $scope.filter['year#<'] = '20' + r[1];

        } else if (r[2] === '-') {
          if (! isEmpty(r[3])) {
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

    $scope.filter = pickBy($scope.filter);
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
    url = pickBy(url);
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

    var minYear = get($scope.filter, 'year#=',
                  get($scope.filter, 'year#<', 1995));
    if (fetching || lowerYear < minYear) {
      return;
    }

    if (
      ($scope.order === $scope.orderBys.time && lowerYear > minYear) ||
      $scope.displayLimit > ($scope.filteredCourses.length - 5) || force
    ) {
      fetching = true;

      lowerYear = lowerYear - 2;
      Courses
        .fetch($scope.regulation_id, lowerYear, upperYear, null)
        .then(function(newCourses) {
          courses = newCourses;
          fetching = false;
          applyFilter();
        });
    }
  };


  // get all regulations
  Restangular
    .all('regulations')
    .getList()
    .then(function(regulations) {
      var t = find( regulations, { regulation_id : 4 } );
      $scope.regulations = without( regulations, t );

      $scope.regulations.unshift({
        regulation_id : '',
        regulation: 'All courses'
      });
      fetchParams();
    });
}
