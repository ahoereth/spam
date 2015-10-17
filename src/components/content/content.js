(function() {
  'use strict';

  /**
   * MODULE: spam.content
   * DIRECTIVE: content
   * CONTROLLER: ContentController
   */
  angular
    .module('spam.content', [
      'ngRoute',
      'lodash'
    ])
    .directive('content', contentDirective)
    .controller('ContentController', contentController);




  /* @ngInject */
  function contentDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'components/content/content.html',
      controller: 'ContentController',
      controllerAs: 'content'
    };
  }




  /* @ngInject */
  function contentController(
    $scope,
    $location,
    _
  ) {
    var ctrl = this;

    function updateContentClass() {
      var name = _.kebabCase($location.path().replace('~', 'user'));
      name = name ? name : 'root';
      ctrl.classnames = name;
    }

    $scope.$on('$locationChangeStart', updateContentClass);
    updateContentClass();
  }

})();
