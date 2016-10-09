import angular from 'angular';

import httpIntercept from '../app/services/http-intercept';

import controller from './NotificationsController';
import template from './notifications.html';


/**
 * MODULE: spam.notifications
 * COMPONENT: notifications
 *
 * Currently this is just a notification about HTTP request/connection
 * errors. Idea here is to expand this into a more general notification
 * system - if required.
 */
export default angular
  .module('spam.notifications', [httpIntercept])
  .component('notifications', {
    template,
    controller,
    controllerAs: 'notifications',
  })
  .name;
