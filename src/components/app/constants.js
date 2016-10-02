import angular from 'angular';


export const TITLE = 'Studyplanning in Cognitive Science';
export const DEBUG = true;
// export const APIURL = 'https://cogsci.uni-osnabrueck.de/~SPAM/api';
export const APIURL = BASE + 'api';
export const O2URL = 'https://cogsci.uni-osnabrueck.de/~SPAM/api/o2.php';


/**
 * MODULE: spam.app.constants
 * CONSTANTS:
 *   TITLE
 *   DEBUG
 *   APIURL
 *   O2URL
 */
export default angular
  .module('spam.app.constants', [])
  .constant('TITLE', TITLE)
  .constant('DEBUG', DEBUG)
  .constant('APIURL', APIURL)
  .constant('O2URL', O2URL)
  .name;
