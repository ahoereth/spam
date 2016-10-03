import angular from 'angular';
import ngRoute from 'angular-route';

import scroll from '../lib/scroll';
import notifications from '../notifications';
import ContentController from './ContentController';


const contentComponent = {
  templateUrl: 'components/content/content.html',
  controller: 'ContentController',
  controllerAs: 'content'
};


/**
 * MODULE: spam.content
 * COMPONENT: content
 * CONTROLLER: ContentController
 */
export default angular
  .module('spam.content', [ngRoute, scroll, notifications])
  .controller('ContentController', ContentController)
  .component('content', contentComponent)
  .name;
