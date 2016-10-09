import angular from 'angular';

import help from '../help';
import settings from '../user/settings';
import logout from '../user/logout';

import controller from './FooterController';
import template from './footer.html';


/**
 * MODULE: spam.footer
 * COMPONENT: footer
 */
export default angular
  .module('spam.footer', [help, settings, logout])
  .component('footer', { template, controller, controllerAs: 'footer' })
  .name;
