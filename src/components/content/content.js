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
    $window,
    $document,
    Scroll,
    _
  ) {
    var ctrl = this;
    var currentRouteName;
    var classnames = {};

    function updateContentClass(e, classnamesSet) {
      var name = _.kebabCase($location.path().replace('~', 'user'));
      name = name ? name : 'root';
      if (currentRouteName !== name) {
        classnames = {};
        currentRouteName = name;
        classnames[name] = true;
      }

      if (e && 'content-classname' === e.name) {
        classnames = _.extend(classnames, classnamesSet);
      }

      ctrl.classnames = classnames;
    }

    $scope.$on('$locationChangeStart', updateContentClass);
    $scope.$on('content-classname', updateContentClass);
    updateContentClass();

    Scroll.addListener(function() {
      var clientHeight = Scroll.getClientHeight();
      var scrolled = Scroll.getScrolledDistance();
      var bottom = clientHeight + scrolled;
      updateContentClass({name: 'content-classname'}, {
        'scrolled': Scroll.getScrollDistance > 50,
        'scroll-bottom': bottom === $document[0].body.clientHeight,
        'second-page': scrolled > clientHeight,
        'third-page': scrolled > (clientHeight * 2),
      });
    });
  }

})();
