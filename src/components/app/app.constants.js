(function() {
  'use strict';

  /**
   * MODULE: spam.app.constants
   * CONSTANTS:
   *   TITLE
   *   APIURL
   *   LOCALAPI
   *   LOCALAPIURL
   */
  angular
    .module('spam.app.constants', [])
    .constant('TITLE', 'Studyplanning in Cognitive Science')
    .constant('LOCALAPI', true)
    .constant('APIURL', 'https://cogsci.uni-osnabrueck.de/~SPAM/api')
    .constant('LOCALAPIURL', 'http://spam.local/api');

})();
