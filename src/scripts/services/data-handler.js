(function() {
  'use strict';

  /**
   * Wrapper for handling all data, storage and caching related stuff.
   */
  angular
    .module('spam.services')
    .factory('DataHandler', dataHandlerFactory);


    /* @ngInject */
  function dataHandlerFactory(
    $rootScope,
    $cacheFactory,
    $document,
    $http,
    $log,
    Transcript,
    Courses,
    User
  ) {
    var webstorage = angular.isDefined(Storage) ? true : false;
    var self = {};

    var logininfo = {
      username: webstorage ? sessionStorage.getItem('username') || localStorage.getItem('username') : null,
      authdata: webstorage ? sessionStorage.getItem('authdata') || localStorage.getItem('authdata') : null
    };

    self.getLogininfo = function(key) {
      return logininfo[key];
    };

    self.updateLogininfo = function(username, authdata, useLocalStorage) {
      logininfo = {
        username: username,
        authdata: authdata
      };

      if (webstorage) {
        if (useLocalStorage) {
          localStorage.setItem('authdata', authdata);
          localStorage.setItem('username', username);
        } else {
          sessionStorage.setItem('authdata', authdata);
          sessionStorage.setItem('username', username);
        }
      }
    };

    self.removeLogininfo = function() {
      logininfo = {};
      $http.defaults.headers.common.Authorization = undefined;
      if (angular.isDefined($document.execCommand)) {
        $document.execCommand('ClearAuthenticationCache');
      }

      if (webstorage) {
        sessionStorage.removeItem('authdata');
        sessionStorage.removeItem('username');
        localStorage.removeItem('authdata');
        localStorage.removeItem('username');
      }
    };

    self.resetGuide = function() {
      var guide = $cacheFactory.get('guide');
      if (guide) { guide.removeAll(); }
    };

    self.removeUserDependent = function() {
      self.resetGuide();
      Courses.reset();
      Transcript.reset();
      $rootScope.loginform = { username: '' };
    };

    self.removeAll = function() {
      self.removeLogininfo();
      self.removeUserDependent();
    };

    self.userInit = function(data) {
      self.removeUserDependent();
      $rootScope.user = User.construct(data);
    };

    return self;
  }
})();
