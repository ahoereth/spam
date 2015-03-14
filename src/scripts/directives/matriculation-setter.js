(function() {
  'use strict';

  angular
    .module('spam.directives')
    .directive('matriculationSetter', matriculationSetterDirective);

  /* @ngInject */
  function matriculationSetterDirective(User, _) {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'partials/directives/matriculation-setter.html',
      link: function(scope, elem, attrs) {
        var currentYear = scope.meta.currentTermYear;
        scope.verifyButton = ! _.isUndefined(attrs.verify);
        scope.years = _.range(currentYear, currentYear - 3, -1);

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
