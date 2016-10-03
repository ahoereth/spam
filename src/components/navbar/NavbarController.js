import { assign, isEmpty, trim, isUndefined, shuffle, pickBy } from 'lodash-es';


export default class NavbarController {
  static $inject = [
    '$rootScope', '$scope', '$location', '$filter', '$timeout', 'User',
    'Courses',
  ];

  constructor($rootScope, $scope, $location, $filter, $timeout, User, Courses) {
    var courses = [];
    var hideLoader;
    var year = new Date().getFullYear();
    var lowerYear = year - 1;
    var upperYear = year + 1;
    var fetching = false;
    var filteredIds = [];
    var filteredSelectedKey = 0;

    assign(this, {
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


    const userConstruct = (event, user) => {
      if (!user) {
        this.user = false;
      } else {
        this.user = {
          username: user.username,
          role: user.role,
          rank: user.rank
        };
      }
    }

    $scope.$on('user-construct', userConstruct);
    //userConstruct(null, User.details);


    /**
     * Close dropdown navigation on mobile devices when changing route.
     */
    $rootScope.$on('$routeChangeSuccess', () => { this.navExpanded = false; });


    /**
     * Watch the loading variable to show or hide the loading animation.
     */
    $rootScope.$watch('loading', (n) => {
      if (n > 0) {
        $timeout.cancel(hideLoader);
        this.showLoader = true;
      } else if (n < 0) {
        $rootScope.loading = 0;
      } else {
        hideLoader = $timeout(() => { this.showLoader = false; }, 1100);
      }
    });


    /**
     * Watch the quick search input field for changes.
     */
    $scope.$watch(() => this.search.query, (query, oldQuery) => {
      if (query === oldQuery) { return; }

      var match = query.match(/^([ws])?s?(\d{2,4})?:? (.*)$/i);
      if (match) {
        this.search.filter = pickBy({
          'term'   : isEmpty(match[1]) ? '' : match[1].toUpperCase(),
          'year'   : isEmpty(match[2]) ? '' : ('20' + match[2]).slice(-4),
          'course' : trim(match[3])
        });
      } else { // this is just a backup if the regex above fails
        this.search.filter = {
          course : query
        };
      }

      applyFilter();
    });


    /**
     * TODO
     */
    const applyFilter = () => {
      if (this.search.query.length === 0) {
        this.search.filtered = [];
        return;
      }

      this.search.filtered =
        $filter('courseFilter')(courses, this.search.filter)
          .splice(0, this.search.limit);

      fetch();
    };


    /**
     * TODO
     */
    const fetch = () => {
      if (lowerYear < 1995 || fetching) { return; }

      if (this.search.limit > this.search.filtered.length) {
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
    $scope.$watch(() => this.search.focus, focused => {
      if (focused === false) {
        searchBoxToggle('blur');
      } else if (focused) {
        filteredSelectedKey = 0;
        this.search.selected = filteredIds[filteredSelectedKey];

        if (!this.search.active) {
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
    $scope.$watch(() => this.search.hover, hovering => {
      $timeout.cancel(mouseTimeout);
      mouseTimeout = $timeout(() => {
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
    const searchBoxToggle = happening => {
      $timeout.cancel(states.timer);

      // save information about the current state
      switch (happening) {
        case 'mouseover': states.mouse = true;  break;
        case 'mouseout' : states.mouse = false; break;
        case 'focus'    : states.input = true;  break;
        case 'blur'     : states.input = false; break;
      }

      // if input is focused always show the results
      if (states.input && !this.search.active) {
        this.search.active = true;
        this.search.placeholder =
          prefix[prefix_i++ % prefix.length] +
          ': Try prepending a term and/or year';

      // if input is not focused and mouse is not hovering the
      } else if (!states.input && !states.mouse) {

        // dont hide it directly
        states.timer = $timeout(() => {
          if (!isUndefined(this.search)) {
            this.search.active = false;
            this.search.placeholder = 'Quick search';
          }
        }, 300);
      }
    };
    var states = { mouse: false, input: false, timer: null };
    var prefix_i = 0;
    var prefix = shuffle(['W11', 'WS', 'SS2013', 'W1984', 'S12', 'W13', '12']);


    /**
     * Checks if the given path is a substring of the beginning of the current
     * route and returns the css class 'active' for highlighting.
     *
     * @param string path the string to look for in the route
     * @return string 'active':''
     */
    this.getNavigationActiveClass = path => {
      return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    };
  }
}
