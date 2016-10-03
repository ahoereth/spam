import angular from 'angular';

import unicorn from '../lib/unicorn';
import routes from '../app/services/routes';
import userLoginForm from '../user/login/form';
import NotAuthorizedController from './NotAuthorizedController';


const notAuthorizedRouting = ['RoutesProvider', RoutesProvider => {
  RoutesProvider.add('/401', {
    templateUrl: 'components/401/401.html',
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
