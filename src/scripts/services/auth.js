(function() {
  'use strict';

  /**
   * HTTP Authentication factory.
   */
  angular
    .module('spam.services')
    .factory('Auth', authFactory);


  /* @ngInject */
  function authFactory(
    $rootScope,
    $http,
    $q,
    base64,
    Restangular,
    DataHandler,
    User,
    _
  ) {
    var deferredLogin = 'not_initiated';

    var login = function () {
      deferredLogin = $q.defer();

      var username = DataHandler.getLogininfo('username');
      $http.defaults.headers.common.Authorization =
        'Basic ' + DataHandler.getLogininfo('authdata');

      if (! _.isEmpty(username)) {
        // Visualize the login process.
        $rootScope.loginform = _.extend(
          $rootScope.loginform || {},
          {loading: true}
        );

        // Server login request.
        Restangular
          .one('users', username)
          .get()
          .then(
            function(user) {
              DataHandler.userInit(user);
              deferredLogin.resolve(User.details);
            }, function() {
              User.destroy();
              deferredLogin.reject();
            }
          )
          .finally(function() {
            $rootScope.loginform.loading = false;
          });
      } else {
        deferredLogin.reject();
      }

      return deferredLogin.promise;
    };

    // Initiate the login process as early as possible so we do not have to start
    // it when a controller is initiated. No matter what page the user is viewing,
    // we are interested in if he is logged in or not.
    login();

    return {
      init: function (nick, password, useLocalStorage) {
        var encoded = base64.encode(nick + ':' + password);
        DataHandler.updateLogininfo(nick, encoded, useLocalStorage);
        return login();
      },


      authenticate: function (accessSet) {
        var loginPromise, deferredAuthentication = $q.defer();

        if ('not_initiated' === deferredLogin) {
          // Login process was not initiated yet, do so
          loginPromise = login();

        } else {
          // Login process was initiated before, get the promise
          loginPromise = deferredLogin.promise;
        }

        if (accessSet === 0) {
          // accessSet is 0, therefore everybody is legitimated to view this site
          deferredAuthentication.resolve(User.details);

        } else {
          // accessSet is something more specific, therefore we need to check
          // the user information (after the login promise is fulfilled)

          // when login was successful
          loginPromise.then(function() {
            // Login was successful.

            if (
              // accessSet is a explicit user rank integer and the users rank is
              // equal or higher
              (_.isNumber(accessSet) && accessSet <= User.details.rank) ||

              // The user himself is allowed to see this route, we will
              // only retrieve data related to him
              (! _.isUndefined(accessSet.self)) ||

              // The user is explicitly named in the accessSet, so he is allowed
              // to view this route as well
              (!_.isUndefined(accessSet[User.getUsername()]))
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
})();
