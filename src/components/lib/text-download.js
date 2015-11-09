(function () {
  'use strict';

  /**
   * MODULE: textDownload
   * FILTER: textDownload
   * DIRECTIVE: textDownload
   */
  angular
    .module('textDownload', ['ab-base64'])
    .config(textDownloadConfig)
    .filter('textDownload', textDownloadFilter)
    .directive('textDownload', textDownloadDirective);




  /**
   * Add the 'data' prefix to the link whitelist
   */
  function textDownloadConfig($compileProvider) {
    var white = ('' + $compileProvider.aHrefSanitizationWhitelist()).split('|');
    white.splice(Math.floor(white.length/2), 0, 'data');
    $compileProvider.aHrefSanitizationWhitelist(white.join('|'));
  }




  /* @ngInject */
  function textDownloadFilter(base64) {
    return function(text) {
      return 'data:application/octet-stream;charset=utf-16le;base64,' +
             base64.encode(text);
    };
  }




  /* @ngInject */
  function textDownloadDirective(base64) {
    return {
      restrict: 'A',
      scope: {
        textDownload: '='
      },
      link: function(scope, elem) {
        scope.$watch('textDownload', function(text) {
          elem.attr('href',
            'data:application/octet-stream;charset=utf-16le;base64,' +
            base64.encode(text)
          );
        });
      }
    };
  }

}());
