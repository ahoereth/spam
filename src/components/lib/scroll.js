import angular from 'angular';
import { throttle } from 'lodash-es';


const scrollFactory = ['$timeout', '$window', ($timeout, $window) => {
  var _listening = false;
  var _listeners = [];


  function _onScroll() {
    for (var i = 0; i < _listeners.length; i++) {
      if (angular.isFunction(_listeners[i])) {
        _listeners[i]();
      }
    }
  }


  var _onScrollThrottled = throttle(function() {
    $timeout(_onScroll, 0);
  }, 20);


  function addListener(func) {
    _listeners.push(func);

    if (!_listening) {
      angular.element($window).bind('scroll', _onScrollThrottled);
      _listening = false;
    }

    return _listeners.length-1;
  }


  function removeListener(idx) {
    _listeners.splice(idx, 1);

    if (!_listeners.length) {
      angular.element($window).unbind('scroll', _onScrollThrottled);
      _listening = false;
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
    addListener: addListener,
    removeListener: removeListener,
    getClientHeight: getClientHeight,
    getScrolledDistance: getScrolledDistance
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
