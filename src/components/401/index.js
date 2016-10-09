import angular from 'angular';

import unicorn from '../lib/unicorn';
import routes from '../app/services/routes';
import userLoginForm from '../user/login/form';
import NotAuthorizedController from './NotAuthorizedController';
import template from './401.html';

const notAuthorizedRouting = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/401', {
    template,
    controller: 'NotAuthorizedController',
    controllerAs: '$ctrl',
    title: 'Not authorized.',
  });
}];


/**
 * MODULE: spam.401
 * ROUTE: /401
 */
export default angular
  .module('spam.401', [unicorn, routes, userLoginForm])
  .controller('NotAuthorizedController', NotAuthorizedController)
  .config(notAuthorizedRouting)
  .name;
