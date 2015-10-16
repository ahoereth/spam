(function() {
  'use strict';

  /**
   * MODULE: spam.components.courses
   */
  angular
    .module('spam.components.courses', [
      'spam.components.courses.filters',
      'spam.components.courses.services',
      'spam.components.courses.index',
      'spam.components.courses.single',
      'spam.components.courses.row',
      'spam.components.courses.add-remove'
    ]);

})();
