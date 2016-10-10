import angular from 'angular';
import ngSanitize from 'angular-sanitize';
import { isUndefined, each, trim } from 'lodash-es';


const prerequisitesFilter = ['$sce', function prerequisitesFilter($sce) {
  // used for caching the trusted strings
  const trusted = {};

  return haystack => {
    if (haystack === null) {
      return haystack;
    }

    const regex = /(?:(Prerequisites:) ?(.*)\n?)?([\S\s]*)?/ig;
    let output = '';

    const result = regex.exec(haystack);
    if (!isUndefined(result[1])) {
      output += `<p><strong>${result[1]}</strong>&nbsp;`;

      if (!isUndefined(result[2])) {
        // split string in single prerequisite and walk over them
        result[2] = result[2].split(',');
        each(result[2], (prerequisite, k) => {
          // remove stuff and generate link
          prerequisite = trim(prerequisite, ' .');
          output += `<a href="courses?title=${encodeURIComponent(prerequisite)}">${prerequisite}</a>`;

          // add comma if there are more prerequisites
          if (result[2].length > k + 1) {
            output += ',&nbsp;';
          }
        });
        output += '</p>';
      }
    }

    // get normal description text if there is any, convert ln to break
    if (!isUndefined(result[3])) {
      result[3] = result[3].replace(/\n/g, '<br>');
      output += `<p>${result[3]}</p>`;
    }

    return trusted[output] || (trusted[output] = $sce.trustAsHtml(output));
  };
}];


/**
 * MODULE: spam.courses.filters.prerequisites
 * FILTER: prerequisites
 *
 * Parse a course's description text for prerequisits and make them hyperlinks.
 */
export default angular
  .module('spam.courses.filters.prerequisites', [ngSanitize])
  .filter('prerequisites', prerequisitesFilter)
  .name;
