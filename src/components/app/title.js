import angular from 'angular';
import { forIn, get, isString, isEmpty, isPlainObject } from 'lodash-es';

import { TITLE } from './constants';


/**
 * MODULE: spam.app.title
 *
 * TODO: Refactor this.
 */
export default angular.module('spam.app.title', []).run(title).name;




/* @ngInject */
function title($rootScope) {
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
    if (isString(data) && ! isEmpty(data)) {
      title = data + ' :: ' + title;
    }

    // Inject username.
    if (username) {
      title = title.replace(':username', username);
    }

    if (isPlainObject(data)) {
      forIn(data, function(val, key) {
        title = title.replace(key, val);
      });
    }

    $rootScope.title = title;
  }

  // Save the current username when it changes.
  $rootScope.$on('user-construct', function(event, user) {
    username = get(user, 'username');
  });

  // Listen for title data change event.
  $rootScope.$on('title', constructTitle);
  //constructTitle();
}
