import angular from 'angular';
import { throttle } from 'lodash-es';


const scrollFactory = ['$timeout', '$window', ($timeout, $window) => {
  const listeners = [];
  let listening = false;


  function onScroll() {
    for (let i = 0; i < listeners.length; i++) {
      if (angular.isFunction(listeners[i])) {
        listeners[i]();
      }
    }
  }


  const onScrollThrottled = throttle(() => {
    $timeout(onScroll, 0);
  }, 20);


  function addListener(func) {
    listeners.push(func);

    if (!listening) {
      angular.element($window).bind('scroll', onScrollThrottled);
      listening = false;
    }

    return listeners.length - 1;
  }


  function removeListener(idx) {
    listeners.splice(idx, 1);

    if (!listeners.length) {
      angular.element($window).unbind('scroll', onScrollThrottled);
      listening = false;
    }
  }


  function getClientHeight() {
    return $window.document.documentElement.clientHeight;
  }


  function getScrolledDistance() {
    return $window.scrollY ||
           $window.document.documentElement.scrollTop ||
           $window.document.body.scrollTop;
  }


  return {
    addListener,
    removeListener,
    getClientHeight,
    getScrolledDistance,
  };
}];


/**
 * MODULE: scroll
 * SERVICE: Scroll
 */
export default angular
  .module('scroll', [])
  .factory('Scroll', scrollFactory)
  .name;
