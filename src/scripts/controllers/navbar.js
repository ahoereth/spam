(function() {
  'use strict';

  angular
    .module('spam.controllers')
    .controller('Navbar', navbarCtrl);


  /* @ngInject */
  function navbarCtrl(
    $rootScope,
    $scope,
    $location,
    $filter,
    $timeout,
    _,
    User,
    Courses
  ) {
    var courses = [],
        hideLoader,
        lowerYear = $rootScope.meta.year-1,
        upperYear = $rootScope.meta.year+1,
        fetching = false,
        filteredIds = [],
        filteredSelectedKey = 0;

    $scope = _.extend($scope, {
      search : {
        query : '',
        filtered : [],
        limit : 4,
        filter : {},
        selected : null,
        placeholder : 'Quick search'
      },
      navExpanded : false,
    });


    /**
     * Close dropdown navigation on mobile devices when changing route.
     */
    $rootScope.$on('$routeChangeSuccess', function() {
      $scope.navExpanded = false;
    });


    /**
     * Watch the loading variable to show or hide the loading animation.
     */
    $rootScope.$watch('loading', function(n) {
      if (n > 0) {
        $timeout.cancel(hideLoader);
        $scope.showLoader = true;
      } else if (n < 0) {
        $rootScope.loading = 0;
      } else {
        hideLoader = $timeout(function() {
          $scope.showLoader = false;
        }, 1100);
      }
    });


    /**
     * Watch the quick search input field for changes.
     */
    $scope.$watch('search.query', function(query, oldQuery) {
      if (query === oldQuery) { return; }

      var match = query.match(/^([ws])?s?(\d{2,4})?:? (.*)$/i);
      if (match) {
        $scope.search.filter = {
          'term'   : _.isEmpty(match[1]) ? '' : match[1].toUpperCase(),
          'year'   : _.isEmpty(match[2]) ? '' : ('20' + match[2]).slice(-4),
          'course' : _.trim(match[3])
        };
        _.compactObject($scope.search.filter);
      } else { // this is just a backup if the regex above fails
        $scope.search.filter = {
          course : query
        };
      }

      applyFilter();
    });


    /**
     * TODO
     */
    var applyFilter = function() {
      if ($scope.search.query.length === 0) {
        $scope.search.filtered = [];
        return;
      }

      $scope.search.filtered = $filter('courseFilter')
        (courses, $scope.search.filter)
        .splice(0, $scope.search.limit);

//      resetKeyboardNavigation();
      fetch();
    };


    /**
     * TODO
     */
    var fetch = function() {
      if (lowerYear < 1995 || fetching) { return; }

      if ($scope.search.limit > $scope.search.filtered.length) {
        fetching = true;
        Courses
          .fetch(User.getRegulation(1), lowerYear, upperYear, null)
          .then(function(newCourses) {
            courses = newCourses;
            fetching = false;
            applyFilter();
          });
        lowerYear = lowerYear - 2;
      }
    };


    /**
     * Watch the focus property of the input field.
     */
    $scope.$watch('search.focus', function(focused) {
      if (focused === false) { searchBoxToggle('blur'); }
      else if (focused) {

        filteredSelectedKey = 0;
        $scope.search.selected = filteredIds[filteredSelectedKey];

        if (! $scope.search.active) {
          applyFilter();
        }

        searchBoxToggle('focus');
      }
    }, true);


    /**
     * Watch the hover property of the navbar/quick search results.
     * The timeout is required because moving the mouse inline the "area-to-be-hovered"
     * also often triggers this event.
     */
    $scope.$watch('search.hover', function(hovering) {
      $timeout.cancel(mouseTimeout);
      mouseTimeout = $timeout(function() {
        if (hovering === false) { searchBoxToggle('mouseout' ); }
        else if (hovering)      { searchBoxToggle('mouseover'); }
      }, 200);
    }, true);
    var mouseTimeout;


    /**
     * Change the quick search result box visibility.
     * The box will stay visible while mouseover or while input field is focused,
     * but it will only start to be visible on focus.
     *
     * The box will not hide directly but with a offset of 300ms
     * (eventually plus the hover offset defined above).
     *
     * @param string happening 'mouseover'/'mouseout'/'focus'/'blur'
     */
    var searchBoxToggle = function(happening) {
      $timeout.cancel(states.timer);

      // save information about the current state
      switch (happening) {
        case 'mouseover': states.mouse = true;  break;
        case 'mouseout' : states.mouse = false; break;
        case 'focus'    : states.input = true;  break;
        case 'blur'     : states.input = false; break;
      }

      // if input is focused always show the results
      if (states.input && ! $scope.search.active) {
        $scope.search.active = true;
        $scope.search.placeholder =
          prefix[prefix_i++ % prefix.length] +
          ': Try prepending a term and/or year';

      // if input is not focused and mouse is not hovering the
      } else if (! states.input && ! states.mouse) {

        // dont hide it directly
        states.timer = $timeout(function() {
          if (! _.isUndefined($scope.search)) {
            $scope.search.active = false;
            $scope.search.placeholder = 'Quick search';
          }
        }, 300);
      }
    };
    var states = {mouse: false, input: false, timer: null};
    var prefix_i = 0;
    var prefix = _.shuffle([
      'W11',
      'WS',
      'SS2013',
      'W1984',
      'S12',
      'W13',
      '12'
    ]);


    /**
     * Checks if the given path is a substring of the beginning of the current
     * route and returns the css class 'active' for highlighting.
     *
     * @param string path the string to look for in the route
     * @return string 'active':''
     */
    $scope.getNavigationActiveClass = function(path) {
      return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    };
  }
})();
