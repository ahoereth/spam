import angular from 'angular';
import 'restangular';

import blurOnEnter from '../../lib/blur-on-enter';
import textDownload from '../../lib/text-download';
import tooltips from '../../lib/tooltips';
import routes from '../../app/services/routes';
import userService from '../services/user';
import matriculationSetter from './matriculation-setter';


/**
 * MODULE: spam.user.settings
 * ROUTE: /~/settings
 * CONTROLLER: UserSettingsController
 */
export default angular
  .module('spam.user.settings', [
    'restangular',
    tooltips,
    blurOnEnter,
    textDownload,
    routes,
    userService,
    matriculationSetter
  ])
  .config(userSettingsRouting)
  .controller('UserSettingsController', userSettingsController)
  .name;




/* @ngInject */
function userSettingsRouting(RoutesProvider) {
  RoutesProvider.add('/~/settings', {
    controller: 'UserSettingsController',
    controllerAs: 'settings',
    templateUrl: 'components/user/settings/settings.html',
    title: ':username\'s settings',
    access: 1
  });
}




/* @ngInject */
function userSettingsController($scope, Restangular, User) {
  var ctrl = this;
  ctrl.user = User.details;

  $scope.$watchGroup(['user.firstname', 'user.lastname'], function(n, o) {
    if (n === o) { return; }

    User.updateUser({
      firstname: n[0],
      lastname:  n[1]
    }, true);
  });

  ctrl.deleteUser = function() {
    User.deleteUser();
  };

  ctrl.export = {
    loading: false,
    data: false,
    init: function() {
      ctrl.export.loading = true;
      ctrl.user.get().then(function(data) {
        ctrl.export.data = JSON.stringify(data.plain(), null, '  ');
        ctrl.export.loading = false;
      });
    }
  };
}
