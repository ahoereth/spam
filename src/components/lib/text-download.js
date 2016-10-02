import angular from 'angular';


/**
 * MODULE: textDownload
 * FILTER: textDownload
 * DIRECTIVE: textDownload
 */
export default angular
  .module('textDownload', ['ab-base64'])
  .config(textDownloadConfig)
  .filter('textDownload', textDownloadFilter)
  .directive('textDownload', textDownloadDirective)
  .name;




/**
 * Add the 'data' prefix to the link whitelist
 */
function textDownloadConfig($compileProvider) {
  var whitelist = $compileProvider.aHrefSanitizationWhitelist();
  whitelist = whitelist.toString().slice(1,-1).split('|');
  whitelist.splice(Math.floor(whitelist.length/2), 0, 'data');
  whitelist = new RegExp(whitelist.join('|'));
  $compileProvider.aHrefSanitizationWhitelist(whitelist);
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
