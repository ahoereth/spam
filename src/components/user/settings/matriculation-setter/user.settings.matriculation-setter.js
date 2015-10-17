(function() {
  'use strict';

  /**
   * MODULE: spam.user.settings.matriculation-setter
   * DIRECTIVE: matriculation-setter
   */
  angular
    .module('spam.user.settings.matriculation-setter', [
      'lodash',
      'mgcrea.ngStrap.button',
      'spam.user.services.user'
    ])
    .directive('matriculationSetter', userMatriculationSetterDirective);




  /* @ngInject */
  function userMatriculationSetterDirective(User, _) {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'components/user/settings/matriculation-setter/' +
                   'user.settings.matriculation-setter.html',
      link: function(scope, elem, attrs) {
        var currentYear = scope.meta.currentTermYear;
        scope.verifyButton = ! _.isUndefined(attrs.verify);
        scope.years = _.range(currentYear, currentYear - 3, -1);
        scope.user = User.details;

        scope.$watchGroup(['user.mat_year', 'user.mat_term'], function(n, o) {
          if (n === o) { return; }

          User.updateUser({
            mat_year: n[0],
            mat_term: n[1]
          }, true);
        });

        scope.verify = function() {
          scope.user.mat_verify = 1;
          User.updateUser(_.pick(scope.user,
            'mat_year',
            'mat_term',
            'mat_verify'
          ), true);
        };
      }
    };
  }

})();
