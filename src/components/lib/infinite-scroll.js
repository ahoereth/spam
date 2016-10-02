import angular from 'angular';

import scroll from './scroll';


/**
 * MODULE: infiniteScroll
 * DIRECTIVE: infiniteScroll
 */
export default angular
  .module('infiniteScroll', [scroll])
  .directive('infiniteScroll', infiniteScrollDirective)
  .name;




/* @ngInject */
function infiniteScrollDirective($window, $rootScope, Scroll) {
  return {
    link: function(scope, elem, attrs) {
      function handler() {
        var bottom = Scroll.getClientHeight() + Scroll.getScrolledDistance();
        var distance = (elem[0].offsetTop + elem[0].clientHeight) - bottom;
        if (distance <= $window.innerHeight) {
          if ($rootScope.$$phase) {
            return scope.$eval(attrs.infiniteScroll);
          } else {
            return scope.$apply(attrs.infiniteScroll);
          }
        }
      }

      var id = Scroll.addListener(handler);
      scope.$on('$destroy', function() {
        Scroll.removeListener(id);
      });
    }
  };
}
