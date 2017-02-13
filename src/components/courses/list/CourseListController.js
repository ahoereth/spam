import {
  extend, isUndefined, compact, trim, isEmpty, get, find, without, pickBy,
} from 'lodash-es';


export default class CourseListController {
  static $inject = [
    '$rootScope', '$scope', '$location', '$routeParams',
    '$filter', '$q', 'Restangular', 'Scroll', 'Courses',
  ];

  constructor(
    $rootScope, $scope, $location, $routeParams,
    $filter, $q, Restangular, Scroll, Courses,
  ) {
    const originalDisplayLimit = 25;
    const year = new Date().getFullYear();
    const upperYear = year + 1;
    let lowerYear = year;
    let url = {};
    let courses = [];

    extend($scope, {
      coursesPerFetch: 100,
      courseSelected: 0,
      fetchNoMore: false,
      displayLimit: 25,
      filter: {},
      filteredCourses: [],
      fetching: false,
      textModelOptions: {
        updateOn: 'default blur',
        debounce: { default: 200, blur: 0 },
      },
      orderBys: { /* eslint-disable key-spacing, no-multi-spaces */
        code:        ['code',          '-year', '-term', 'course'],
        '-code':     ['-code',         '-year', '-term', 'course'],
        course:      ['course',        '-year', '-term'],
        '-course':   ['-course',       '-year', '-term'],
        teachers:    ['teachers_str',  '-year', '-term', 'course'],
        '-teachers': ['-teachers_str', '-year', '-term', 'course'],
        fields:      ['fields_str',    '-year', '-term', 'course'],
        '-fields':   ['-fields_str',   '-year', '-term', 'course'],
        time:        ['year',          '-term', 'course'],
        '-time':     ['-year',         '-term', 'course'],
      },  /* eslint-enable key-spacing, no-multi-spaces */
    });
    $scope.order = $scope.orderBys['-time'];


    /**
     * Extract the url parameters for use in a search query.
     */
    const fetchParams = () => {
      const params = $routeParams;

      $scope.filter = {
        code: params.code,
        course: params.course,
        teachers_str: params.teacher,
        fields_str: params.field,
        'fields_str#~': params.pm ? '(PM)' : null,
      };

      if (!isUndefined(params.timeframe)) {
        $scope.timeframe = params.timeframe;

        params.timeframe = params.timeframe.toLowerCase();
        if (params.timeframe.charAt(0) === 'w' || params.timeframe.charAt(0) === 's') {
          $scope.filter['term#='] = params.timeframe.charAt(0);
          params.timeframe = params.timeframe.slice(1);
        }

        // eslint-disable-next-line max-len
        const pattern = /(?:^(?:20)?(\d{2})$)|(?:(?:20)?(\d{2})([+-])(?:(?:20)?(\d{2}))?)|(?:([WS])S?(?:20)?(\d{2}))|([WS])/i;
        const r = compact(pattern.exec(trim(params.timeframe)));

        if (!isEmpty(r)) {
          if (isEmpty(r[2])) {
            $scope.filter['year#='] = `20${r[1]}`;
          } else if (r[2] === '+') {
            // year lower limit
            $scope.filter['year#<'] = `20${r[1]}`;
          } else if (r[2] === '-') {
            if (!isEmpty(r[3])) {
              // years range
              $scope.filter['year#<'] = `20${r[1]}`;
              $scope.filter['year#>'] = `20${r[3]}`;
            } else {
              // year upper limit
              $scope.filter['year#>'] = `20${r[1]}`;
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
    const refreshUrl = () => {
      const { filter, regulation_id, timeframe } = $scope;
      const { code, course, teachers_str, fields_str } = filter;
      url = {
        regulation: regulation_id, pm: !!filter['fields_str#~'],
        timeframe, code, course, teacher: teachers_str, fields_str,
      };
      url = pickBy(url);
      $location.search(url);
    };


    /**
     * Refreshes des course list with the new filters applied.
     *
     * TODO: unify with navbar.js
     */
    const applyFilter = (justFetch, force) => {
      const {
        filter, orderBys, order, displayLimit, filteredCourses, regulation_id,
      } = $scope;
      const minYear = get(filter, 'year#=', get(filter, 'year#<', 1995));

      if (!justFetch) {
        $scope.filteredCourses = $filter('courseFilter')(courses, filter);
      }

      if ($scope.fetching || lowerYear < minYear) {
        return;
      }

      if (
        (order === orderBys.time && lowerYear > minYear) ||
        displayLimit > (filteredCourses.length - 5) || force
      ) {
        $scope.fetching = true;

        lowerYear -= 2;
        Courses
          .fetch(regulation_id, lowerYear, upperYear, null)
          .then(newCourses => {
            courses = newCourses;
            $scope.fetching = false;
            applyFilter();
          });
      }
    };


    /**
     * Watches the general filter object. Contains the code, title, teachers and
     * field of study input fields.
     */
    $scope.$watch('filter', (next, current) => {
      if (next === current) { return; }
      applyFilter();
      refreshUrl();
    }, true);


    /**
     * Watches the "obligatory module" checkbox.
     */
    $scope.$watch('pm', (next, current) => {
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
    $scope.$watch('timeframe', (next, current) => {
      if (isUndefined(next) || next === current) { return; }
      refreshUrl(); // delete does not trigger the filter watch
    });


    /**
     * Is triggered when the user changes the regulation input field.
     */
    $scope.$watch('regulation_id', (next, current) => {
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
    $scope.scrollOn = amount => {
      if ($scope.displayLimit < $scope.filteredCourses.length) {
        $scope.displayLimit += isUndefined(amount) ? originalDisplayLimit : amount;
      }

      if ($scope.displayLimit > ($scope.filteredCourses.length - 50)) {
        applyFilter(true);
      }
    };


    $scope.orderBy = order => {
      $scope.order = ($scope.order === $scope.orderBys[order]) ?
        $scope.orderBys[`-${order}`] : $scope.orderBys[order];
      applyFilter(true, true);
    };


    /**
     * Watch for route updates and refetch the course list if required
     */
    $scope.$on('$routeUpdate', (event, route) => {
      if (route.params === url) { return; }
      fetchParams();
    });


    // get all regulations
    Restangular
      .all('regulations')
      .getList()
      .then(regulations => {
        const t = find(regulations, { regulation_id: 4 });
        $scope.regulations = without(regulations, t);

        $scope.regulations.unshift({
          regulation_id: '',
          regulation: 'All courses',
        });
        fetchParams();
      });
  }
}
