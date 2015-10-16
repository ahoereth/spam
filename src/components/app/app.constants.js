(function() {
  'use strict';

  /**
   * MODULE: spam.components.app.constants
   * CONSTANTS:
   *   TITLE
   *   APIURL
   *   LOCALAPI
   *   LOCALAPIURL
   */
  angular
    .module('spam.components.app.constants', [])
    .constant('TITLE', 'Studyplanning in Cognitive Science')
    .constant('LOCALAPI', false)
    .constant('APIURL', 'https://cogsci.uni-osnabrueck.de/~SPAM/api')
    .constant('LOCALAPIURL', '/~SPAM/api');

})();
