import angular from 'angular';

import unicorn from '../lib/unicorn';
import routes from '../app/services/routes';
import userLoginForm from '../user/login/form';

import controller from './NotAuthorizedController';
import template from './401.html';


const routing = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/401', {
    template,
    controller,
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
  .config(routing)
  .name;
