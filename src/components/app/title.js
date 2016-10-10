import angular from 'angular';
import { forIn, get, isString, isEmpty, isPlainObject } from 'lodash-es';

import { TITLE } from './constants';


const title = ['$rootScope', function title($rootScope) {
  let username;

  /**
   * Construct the page title (<head><title>) from the TITLE constant, the
   * route's title prefix and optional contextual variables like the
   * username.
   *
   * @param {string} prefix
   */
  function constructTitle(e, data, clear) {
    let str = clear ? TITLE : ($rootScope.title || TITLE);
    if (isString(data) && !isEmpty(data)) {
      str = `${data} :: ${str}`;
    }

    // Inject username.
    if (username) {
      str = str.replace(':username', username);
    }

    if (isPlainObject(data)) {
      forIn(data, (val, key) => {
        str = str.replace(key, val);
      });
    }

    $rootScope.str = str;
  }

  // Save the current username when it changes.
  $rootScope.$on('user-construct', (event, user) => {
    username = get(user, 'username');
  });

  // Listen for title data change event.
  $rootScope.$on('title', constructTitle);
  // constructTitle();
}];


/**
 * MODULE: spam.app.title
 *
 * TODO: Refactor this.
 */
export default angular.module('spam.app.title', []).run(title).name;
