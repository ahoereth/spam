import angular from 'angular';
import { isEmpty, isUndefined, isNumber } from 'lodash-es';
import base64 from 'angular-utf8-base64';

import userService from './user';


/**
 * MODULE: spam.user.services.auth
 * SERVICE: Auth
 */
export default angular
  .module('spam.user.services.auth', [restangular, userService])
  .factory('Auth', authFactory)
  .name;




/* @ngInject */
function authFactory(
  $rootScope,
  $window,
  $http,
  $q,
  Restangular,
  User
) {
  var deferredLogin = 'not_initiated';

  var login = function () {
    deferredLogin = $q.defer();
    var username = User.logininfo.username;

    if (! isEmpty(username)) {
      $http.defaults.headers.common.Authorization =
        'Basic ' + User.logininfo.authdata;

      // Server login request.
      Restangular.one('users', username).get().then(
        function(data) {
          User.construct(data);
          deferredLogin.resolve(User.details);
        }, function() {
          User.logout();
          deferredLogin.reject();
        }
      );
    } else {
      deferredLogin.reject();
    }

    return deferredLogin.promise;
  };

  return {
    init: function(username, password, useLocalStorage) {
      var authdata = $window.btoa(username + ':' + password);
      User.setLogininfo(username, authdata, useLocalStorage);
      return login();
    },


    authenticate: function(accessSet) {
      var loginPromise, deferredAuthentication = $q.defer();

      if ('not_initiated' === deferredLogin) {
        // Login process was not initiated yet, do so
        loginPromise = login();

      } else {
        // Login process was initiated before, get the promise
        loginPromise = deferredLogin.promise;
      }

      if (accessSet === 0) {
        // accessSet is 0, therefore everybody is legitimated to view this
        // site. We still wait for the server request to return.
        loginPromise.finally(function() {
          deferredAuthentication.resolve(User.details);
        });

      } else {
        // accessSet is something more specific, therefore we need to check
        // the user information (after the login promise is fulfilled)

        // when login was successful
        loginPromise.then(function() {
          // Login was successful.

          if (
            // accessSet is a explicit user rank integer and the users rank is
            // equal or higher
            (isNumber(accessSet) && accessSet <= User.details.rank) ||

            // The user himself is allowed to see this route, we will
            // only retrieve data related to him
            (!isUndefined(accessSet.self)) ||

            // The user is explicitly named in the accessSet, so he is allowed
            // to view this route as well
            (!isUndefined(accessSet[User.getUsername()]))
          ) {
            deferredAuthentication.resolve(User.details);

          } else {
            // Could not match the accessSet to the current user, reject
            // the authentication request
            deferredAuthentication.reject('not_authenticated');
          }

        }, function() {
          // Login was not successful. User is certainly not allowed to see
          // this page, because we already checked accessSet === 0

          // Reject authentication request
          deferredAuthentication.reject('not_authenticated');
        });
      }

      // return the authentication promise
      return deferredAuthentication.promise;
    }
  };
}
