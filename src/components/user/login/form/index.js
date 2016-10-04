import angular from 'angular';
import ngRoute from 'angular-route';

import iif from '../../../lib/iif';
import auth from '../../services/auth';
import LoginformController from './LoginformController';


function loginformDirective() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      username: '=?',
      loading: '=?'
    },
    templateUrl: 'components/user/login/form/form.html',
    controller: 'LoginformController',
    controllerAs: 'loginform',
    bindToController: true
  };
}


/**
 * MODULE: spam.user.login.form
 * COMPONENT: loginform
 * CONTROLLER: LoginformController
 */
export default angular
  .module('spam.user.login.form', [ngRoute, iif, auth])
  .controller('LoginformController', LoginformController)
  .directive('loginform', loginformDirective) // TODO: component
  .name;
