import angular from 'angular';

import scroll from './scroll';


const infiniteScrollDirective = [
  '$window', '$rootScope', 'Scroll',
  function infiniteScrollDirective($window, $rootScope, Scroll) {
    return {
      link: function infiniteScrollLink(scope, elem, attrs) {
        function handler() {
          const bottom = Scroll.getClientHeight() + Scroll.getScrolledDistance();
          const distance = (elem[0].offsetTop + elem[0].clientHeight) - bottom;
          if (distance <= $window.innerHeight) {
            if ($rootScope.$$phase) {
              scope.$eval(attrs.infiniteScroll);
              return;
            }

            scope.$apply(attrs.infiniteScroll);
          }
        }

        const id = Scroll.addListener(handler);
        scope.$on('$destroy', () => {
          Scroll.removeListener(id);
        });
      },
    };
  },
];


/**
 * MODULE: infiniteScroll
 * DIRECTIVE: infiniteScroll
 */
export default angular
  .module('infiniteScroll', [scroll])
  .directive('infiniteScroll', infiniteScrollDirective)
  .name;
