import angular from 'angular';

import httpIntercept from '../app/services/http-intercept';
import NotificationsController from './NotificationsController';

/**
 * MODULE: spam.notifications
 * DIRECTIVE: notifications
 *
 * Currently this is just a notification about HTTP request/connection
 * errors. Idea here is to expand this into a more general notification
 * system - if required.
 */
export default angular
  .module('spam.notifications', [httpIntercept])
  .controller('NotificationsController', NotificationsController) // TODO: component
  .directive('notifications', notificationsDirective) // TODO: component
  .name;




/* @ngInject */
function notificationsDirective() {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    templateUrl: 'components/navbar/navbar.html',
    controller: 'NotificationsController',
    controllerAs: 'notifications'
  };
}
