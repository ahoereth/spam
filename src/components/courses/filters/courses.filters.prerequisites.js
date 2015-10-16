(function() {
  'use strict';

  /**
   * MODULE: spam.components.courses.filters.prerequisites
   * FILTER: prerequisites
   *
   * Parse a course's description text for prerequisits and make them hyperlinks.
   */
  angular
    .module('spam.components.courses.filters.prerequisites', [
      'ngSanitize'
    ])
    .filter('prerequisites', prerequisitesFilter);




  /* @ngInject */
  function prerequisitesFilter($sce, _) {
    // used for caching the trusted strings
    var trusted = {};

    return function (haystack) {
      if (haystack === null) {
        return haystack;
      }

      var output = '', regex = /(?:(Prerequisites:) ?(.*)\n?)?([\S\s]*)?/ig;

      var result = regex.exec(haystack);
      if (! _.isUndefined(result[1])) {
        output += '<p><strong>'+result[1]+'</strong>&nbsp;';

        if (! _.isUndefined(result[2])) {

          // split string in single prerequisite and walk over them
          result[2] = result[2].split(',');
          _.each( result[2], function(prerequisite, k) {
            // remove stuff and generate link
            prerequisite = _.trim( prerequisite, ' .' );
            output += '<a href="courses?title=' + encodeURIComponent(prerequisite) + '">' + prerequisite + '</a>';

            // add comma if there are more prerequisites
            if ( result[2].length > k + 1 ) {
              output += ',&nbsp;';
            }
          });
          output += '</p>';
        }
      }

      // get normal description text if there is any, convert ln to break
      if ( ! _.isUndefined( result[3] ) ) {
        result[3] = result[3].replace( /\n/g, '<br>' );
        output += '<p>' + result[3] + '</p>';
      }

      return trusted[output] || ( trusted[output] = $sce.trustAsHtml( output ) );
    };
  }

})();
