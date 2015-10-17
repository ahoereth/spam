(function() {
  'use strict';

  /**
   * MODULE: spam.courses
   */
  angular
    .module('spam.courses', [
      'spam.courses.filters',
      'spam.courses.services',
      'spam.courses.index',
      'spam.courses.single',
      'spam.courses.row',
      'spam.courses.add-remove'
    ]);

})();
