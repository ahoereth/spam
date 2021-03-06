import angular from 'angular';
import ngRoute from 'angular-route';

import scroll from '../lib/scroll';
import notifications from '../notifications';

import controller from './ContentController';
import template from './content.html';
import './content.css';


/**
 * MODULE: spam.content
 * COMPONENT: content
 */
export default angular
  .module('spam.content', [ngRoute, scroll, notifications])
  .component('content', { template, controller, controllerAs: '$ctrl' })
  .name;
