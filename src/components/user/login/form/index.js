import angular from 'angular';
import ngRoute from 'angular-route';

import iif from '../../../lib/iif';
import auth from '../../services/auth';

import controller from './LoginformController';
import template from './form.html';

/**
 * MODULE: spam.user.login.form
 * COMPONENT: loginform
 */
export default angular
  .module('spam.user.login.form', [ngRoute, iif, auth])
  .component('loginform', {
    bindings: {
      username: '=?',
      loading: '=?',
    },
    controller,
    template,
  }).name;
