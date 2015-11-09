(function() {
  'use strict';

  /**
   * MODULE: spam.app.constants
   * CONSTANTS:
   *   TITLE
   *   APIURL
   */
  angular
    .module('spam.app.constants', [])
    .constant('TITLE', 'Studyplanning in Cognitive Science')
    .constant('APIURL', 'https://cogsci.uni-osnabrueck.de/~SPAM/api');
    //.constant('APIURL', 'http://spam.local/api');

})();
