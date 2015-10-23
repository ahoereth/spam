(function() {
  'use strict';

  /**
   * MODULE: spam.app.title
   *
   * TODO: Refactor this.
   */
  angular
    .module('spam.app.title', [
      'restangular',
      'lodash',
      'spam.app.constants'
    ])
    .run(title);




  /* @ngInject */
  function title(
    $rootScope,
    TITLE,
    _
  ) {
    var username;

    /**
     * Construct the page title (<head><title>) from the TITLE constant, the
     * route's title prefix and optional contextual variables like the
     * username.
     *
     * @param {string} prefix
     */
    function constructTitle(e, data, clear) {
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

    // Save the current username when it changes.
    $rootScope.$on('user-construct', function(event, user) {
      username = _.get(user, 'username');
    });

    // Listen for title data change event.
    $rootScope.$on('title', constructTitle);
    //constructTitle();
  }

})();
