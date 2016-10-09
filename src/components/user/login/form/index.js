import angular from 'angular';
import ngRoute from 'angular-route';

import iif from '../../../lib/iif';
import auth from '../../services/auth';

import controller from './LoginformController';
import template from './form.html';


// TODO: component
const loginformDirective = () => ({
  template,
  controller,
  controllerAs: 'loginform',
  restrict: 'E',
  replace: true,
  scope: {
    username: '=?',
    loading: '=?'
  },
  bindToController: true,
});


/**
 * MODULE: spam.user.login.form
 * COMPONENT: loginform
 * CONTROLLER: LoginformController
 */
export default angular
  .module('spam.user.login.form', [ngRoute, iif, auth])
  .directive('loginform', loginformDirective)
  .name;
