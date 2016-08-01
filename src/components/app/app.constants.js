(function() {
  'use strict';
  /* global BASE */

  /**
   * MODULE: spam.app.constants
   * CONSTANTS:
   *   TITLE
   *   APIURL
   */
  angular
    .module('spam.app.constants', [])
    .constant('TITLE', 'Studyplanning in Cognitive Science')
    .constant('DEBUG', false)
    .constant('APIURL', 'https://cogsci.uni-osnabrueck.de/~SPAM/api')
    // .constant('APIURL', BASE + 'api')
    .constant('O2URL', 'https://cogsci.uni-osnabrueck.de/~SPAM/api/o2.php');

})();
