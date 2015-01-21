(function() {
  'use strict';

  /**
   * User functionality factory. All functionality provided by this factory is
   * injected into the global ($rootScope) user object.
   */
  angular
    .module('spam.services')
    .factory('User', userFactory);


  /* @ngInject */
  function userFactory(
    $rootScope,
    $log,
    Restangular,
    _
  ) {
    var methods = {};

    /**
     * Save userdata to server.
     *
     * @param {object} data  [description]
     * @param {bool}   force Force the update even if the data seems to be
     *                       unchanged.
     */
    methods.updateUser = function(data, force) {
      var putData = {};
      angular.forEach(data, function(value, key) {
        if (! angular.equals($rootScope.user[key], value) || force) {
          putData[key] = value;
          $rootScope.user[key] = value;
        }
      });

      putData.username = $rootScope.user.username;
      putData = Restangular.restangularizeElement(null, putData, 'users');

      putData.put().then(function(user) {
        $rootScope.$broadcast('userUpdated', user);
        $log.info('User data saved.');
      });
    };

    methods.destroy = function() {
      $log.info('Destroying local user data.');
      $rootScope.$broadcast('userDestroy');
    };

    methods.deleteUser = function() {
      $log.info('Deleting global user data.');
      //$rootScope.$broadcast('userDelete');
      if ($rootScope.user) {
        $rootScope.user.remove().then(function() {
          // notify client that deletion was successful
          $log.info('Global user data deleted.');
        }, function() {
          // do something when removing fails
          $log.info('Error while deleting global user data.');
        });

        // handle local and global user data deletion asynchronously
        methods.destroy();
      }
    };

    methods.getRegulation = function(reg) {
      return this.regulation_id || (reg || null);
    };

    methods.getUsername = function() {
      return this.username || null;
    };


    return function(data) {
      if (angular.isDefined(data)) {
        if (angular.isDefined(data.courses)) {
          Restangular.restangularizeCollection(data, data.courses, 'courses');
        }

        if (angular.isDefined(data.fields)) {
          Restangular.restangularizeCollection(data, data.fields, 'fields');
        }

        data.thesis_grade = _.formatGrade(data.thesis_grade);
      }

      return angular.extend(methods, data, {loggedin: ! _.isEmpty(data)});
    };
  }
})();
