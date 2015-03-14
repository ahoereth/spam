(function() {
  'use strict';

  angular
    .module('spam')
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
    /**
     * Construct the page title (<head><title>) from the TITLE constant, the
     * route dependend prefix and optional contextual variables.
     *
     * @param {string} prefix
     */
    function constructTitle(prefix) {
      var title = TITLE;

      // Prefix.
      if (prefix) {
        title = prefix + ' :: ' + title;
      }

      // Inject username.
      if ($rootScope.user) {
        title = title.replace(':username', $rootScope.user.username);
      }

      return title;
    }


    Restangular.configuration.getIdFromElem = function(elem) {
      if (elem.id) {
        return elem.id;
      }

      if (elem.route === 'users') {
        return elem.username;
      } else if (elem.route === 'courses' && elem.parentResource.route === 'users') {
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
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
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
      $rootScope.title = constructTitle(current.title);
    });
  }

})();
