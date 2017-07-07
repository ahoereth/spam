import {
  assign,
  isEmpty,
  isUndefined,
  pickBy,
  shuffle,
  trim,
} from 'lodash-es';

export default class NavbarController {
  static $inject = [
    '$rootScope',
    '$scope',
    '$location',
    '$filter',
    '$timeout',
    'User',
    'Courses',
  ];

  static prefixes = ['W11', 'WS', 'SS2013', 'W1984', 'S12', 'W13', '12'];

  constructor(
    $rootScope,
    $scope,
    $location,
    $filter,
    $timeout,
    User,
    Courses,
  ) {
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$location = $location;
    this.$filter = $filter;
    this.$timeout = $timeout;
    this.User = User;
    this.Courses = Courses;
  }

  $onInit() {
    const year = new Date().getFullYear();
    const filteredIds = [];
    let hideLoader;
    let filteredSelectedKey = 0;
    let mouseTimeout;

    assign(this, {
      courses: [],
      states: { mouse: false, input: false, timer: null },
      prefixI: 0,
      prefixes: shuffle(NavbarController.prefixes),
      upperYear: year + 1,
      lowerYear: year - 1,
      fetching: false,
      search: {
        query: '',
        filtered: [],
        limit: 4,
        filter: {},
        selected: null,
        placeholder: 'Quick search',
      },
      navExpanded: false,
      user: false,
    });

    this.$scope.$on('user-construct', (e, user) => this.userConstruct(user));
    // userConstruct(null, User.details);

    // Close dropdown navigation on mobile devices when changing route.
    this.$rootScope.$on('$routeChangeSuccess', () => {
      this.navExpanded = false;
    });

    // Watch the loading variable to show or hide the loading animation.
    this.$rootScope.$watch('loading', n => {
      if (n > 0) {
        this.$timeout.cancel(hideLoader);
        this.showLoader = true;
      } else if (n < 0) {
        this.$rootScope.loading = 0;
      } else {
        hideLoader = this.$timeout(() => {
          this.showLoader = false;
        }, 1100);
      }
    });

    // Watch the quick search input field for changes.
    this.$scope.$watch(
      () => this.search.query,
      (query, oldQuery) => {
        if (query === oldQuery) {
          return;
        }

        const match = query.match(/^([ws])?s?(\d{2,4})?:? (.*)$/i);
        if (match) {
          this.search.filter = pickBy({
            term: isEmpty(match[1]) ? '' : match[1].toUpperCase(),
            year: isEmpty(match[2]) ? '' : `20${match[2]}`.slice(-4),
            course: trim(match[3]),
          });
        } else {
          // this is just a backup if the regex above fails
          this.search.filter = { course: query };
        }

        this.applyFilter();
      },
    );

    // Watch the focus property of the input field.
    this.$scope.$watch(
      () => this.search.focus,
      focused => {
        if (focused === false) {
          this.searchBoxToggle('blur');
        } else if (focused) {
          filteredSelectedKey = 0;
          this.search.selected = filteredIds[filteredSelectedKey];

          if (!this.search.active) {
            this.applyFilter();
          }

          this.searchBoxToggle('focus');
        }
      },
      true,
    );

    // Watch the hover property of the navbar/quick search results.
    // The timeout is required because moving the mouse inline the
    // "area-to-be-hovered" also often triggers this event.
    this.$scope.$watch(
      () => this.search.hover,
      hovering => {
        this.$timeout.cancel(mouseTimeout);
        mouseTimeout = this.$timeout(() => {
          if (hovering === false) {
            this.searchBoxToggle('mouseout');
            return;
          }

          this.searchBoxToggle('mouseover');
        }, 200);
      },
      true,
    );
  }

  userConstruct(user = {}) {
    if (!user.username) {
      this.user = false;
    } else {
      this.user = {
        username: user.username,
        role: user.role,
        rank: user.rank,
      };
    }
  }

  applyFilter() {
    if (this.search.query.length === 0) {
      this.search.filtered = [];
      return;
    }

    this.search.filtered = this.$filter('courseFilter')(
      this.courses,
      this.search.filter,
    ).splice(0, this.search.limit);

    this.fetch(); // eslint-disable-line no-use-before-define
  }

  fetch() {
    if (this.lowerYear < 1995 || this.fetching) {
      return;
    }

    if (this.search.limit > this.search.filtered.length) {
      this.fetching = true;
      this.Courses
        .fetch(
          this.User.getRegulation(1),
          this.lowerYear,
          this.upperYear,
          null,
        )
        .then(newCourses => {
          this.courses = newCourses;
          this.fetching = false;
          this.applyFilter();
        });
      this.lowerYear -= 2;
    }
  }

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
  searchBoxToggle(happening) {
    this.$timeout.cancel(this.states.timer);

    // save information about the current state
    switch (happening) { // eslint-disable-line default-case
      case 'mouseover':
        this.states.mouse = true;
        break;
      case 'mouseout':
        this.states.mouse = false;
        break;
      case 'focus':
        this.states.input = true;
        break;
      case 'blur':
        this.states.input = false;
        break;
    }

    if (this.states.input && !this.search.active) {
      // if input is focused always show the results
      this.search.active = true;
      this.search.placeholder = `${this.prefixes[
        this.prefixI++ % this.prefixes.length
      ]}: Try prepending a term and/or year`;
    } else if (!this.states.input && !this.states.mouse) {
      // if input is not focused and mouse is not hovering the
      // dont hide it directly
      this.states.timer = this.$timeout(() => {
        if (!isUndefined(this.search)) {
          this.search.active = false;
          this.search.placeholder = 'Quick search';
        }
      }, 300);
    }
  }

  /**
   * Checks if the given path is a substring of the beginning of the current
   * route and returns the css class 'active' for highlighting.
   *
   * @param string path the string to look for in the route
   * @return string 'active':''
   */
  getNavigationActiveClass(path) {
    const location = this.$location.path().substr(0, path.length);
    return location === path ? 'active' : '';
  }
}
