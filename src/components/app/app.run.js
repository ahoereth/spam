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

    // Listen for title data change event.
    $rootScope.$on('title', function(event, title, clear) {
      constructTitle(title, clear);
    });

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

    // Save the current username when it changes.
    $rootScope.$on('user-construct', function(event, user) {
      username = _.get(user, 'username');
    });
  }

})();
