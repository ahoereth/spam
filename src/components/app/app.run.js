(function() {
  'use strict';

  /**
   * MODULE: spam.app.run
   *
   * TODO: Refactor this.
   */
  angular
    .module('spam.app.run', [
      'restangular',
      'lodash',
      'spam.user.services.user',
      'spam.app.constants'
    ])
    .run(appInitialization);




  /* @ngInject */
  function appInitialization(
    $rootScope,
    $location,
    $document,
    $route,
    Restangular,
    User,
    TITLE,
    _
  ) {
    var username;

    /**
     * Construct the page title (<head><title>) from the TITLE constant, the
     * route dependend prefix and optional contextual variables.
     *
     * @param {string} prefix
     */
    function constructTitle(data, clear) {
      var title = clear ? TITLE : ($rootScope.title || TITLE);
      if (_.isString(data) && ! _.isEmpty(data)) {
        title = data + ' :: ' + title;
      }

      // Inject username.
      if (username) {
        title = title.replace(':username', username);
      }

      if (_.isObject(data)) {
        _.forIn(data, function(val, key) {
          title = title.replace(key, val);
        });
      }

      $rootScope.title = title;
    }


    Restangular.configuration.getIdFromElem = function(elem) {
      if (elem.id) {
        return elem.id;
      }

      if (elem.route === 'users') {
        return elem.username;
      } else if (
        elem.route === 'courses' &&
        elem.parentResource && elem.parentResource.route === 'users'
      ) {
        return elem.student_in_course_id;
      } else {
        var e = elem[_.initial(elem.route).join('') + '_id'];
        return e;
      }
    };


    // Set $rootScope meta variables.
    var d = new Date(), m = d.getMonth(), y = d.getFullYear();
    $rootScope.meta = {
      'year'            : d.getFullYear(),
      'month'           : m,
      'terms'           : ['S', 'W'],
      'term'            : (m > 8 || m < 3) ? 'W' : 'S',
      'otherTerm'       : (m > 8 || m < 3) ? 'S' : 'W',
      'currentTermYear' : (m > 3) ? y : y - 1,
      'lastTermYear'    : (m > 8) ? y : y - 1,
      'nextTermYear'    : (m < 3) ? y : y + 1,
      'webstorage'      : _.isUndefined(Storage) ? false : true
    };


    /**
    * Handle errors occurring on route changing. This is called when one of the
    * promises to be resolved before visiting the route is rejected.
    */
    $rootScope.$on('$routeChangeError', function(
      event, current, previous, rejection
    ) {
      if ('not_authenticated' === rejection) {
        $rootScope.requested_route = $location.path();
        $location.path('/401');
      } else {
        $location.path('/login');
      }
    });


    /**
    * Called on every route change for user authentication verification and
    * possible redirecting.
    */
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
      if (_.isUndefined(current)) { return; }

      // Don't allow entering the page on /401
      if (current.originalPath === '/401' && _.isUndefined(previous)) {
        $location.path('/');
        return;
      }

      // Handle page title.
      constructTitle(current.title, true);
    });

    // Listen for title data change event.
    $rootScope.$on('title', function(event, data) {
      constructTitle(data);
    });


    /**
     * Save the current username when it changes.
     */
    $rootScope.$on('user-construct', function(event, user) {
      username = _.get(user, 'username');
    });
  }

})();
