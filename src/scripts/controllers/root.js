(function() {
  'use strict';

  angular
    .module('spam.controllers')
    .controller('Root', rootCtrl);


  /* @ngInject */
  function rootCtrl(
    $rootScope,
    $scope,
    $log,
    $location,
    DataHandler,
    Courses,
    User,
    _
  ) {



  /*  $scope.$on('userDestroy', function() {
      DataHandler.removeAll();
      DataHandler.userInit();
      $location.path('/');
    });*/


    $scope.$on('title', function(event, variables) {
      var title = angular.isDefined(variables.title) ? variables.title : $rootScope.title;

      angular.forEach(variables, function(value, key) {
        if (key.charAt(0) === ':') {
          title = title.replace(key, value);
        }
      });

      if ( title !== '' ) {
        title += ' :: ';
      }

      $rootScope.title = title + 'Studyplanning in Cognitive Science';
    });


    $scope.$on('userUpdated', function(event, user) {
      angular.forEach(user, function(value, key) {
        $scope.user[key] = value;
      });
    });
  }
})();
