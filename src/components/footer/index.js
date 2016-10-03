import angular from 'angular';

import help from '../help';
import settings from '../user/settings';
import logout from '../user/logout';
import FooterController from './FooterController';


const footerComponent = {
  templateUrl: 'components/footer/footer.html',
  controller: 'FooterController',
  controllerAs: 'footer'
};


/**
 * MODULE: spam.footer
 * COMPONENT: footer
 * CONTROLLER: FooterController
 */
export default angular
  .module('spam.footer', [help, settings, logout])
  .controller('FooterController', FooterController)
  .component('footer', footerComponent)
  .name;
