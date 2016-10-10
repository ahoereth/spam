import angular from 'angular';


const textDownloadConfig = ['$compileProvider', $compileProvider => {
  // Add the 'data' prefix to the link whitelist
  let whitelist = $compileProvider.aHrefSanitizationWhitelist();
  whitelist = whitelist.toString().slice(1, -1).split('|');
  whitelist.splice(Math.floor(whitelist.length / 2), 0, 'data');
  whitelist = new RegExp(whitelist.join('|'));
  $compileProvider.aHrefSanitizationWhitelist(whitelist);
}];


const textDownloadFilter = ['$window', $window => text => (
  `data:application/octet-stream;charset=utf-16le;base64,${$window.btoa(text)}`
)];


const textDownloadDirective = ['$window', $window => ({
  restrict: 'A',
  scope: {
    textDownload: '=',
  },
  link: function textDownloadLink(scope, elem) {
    scope.$watch('textDownload', text => {
      elem.attr('href', `data:application/octet-stream;charset=utf-16le;base64,${$window.btoa(text)}`);
    });
  },
})];


/**
 * MODULE: textDownload
 * FILTER: textDownload
 * DIRECTIVE: textDownload
 */
export default angular
  .module('textDownload', [])
  .config(textDownloadConfig)
  .filter('textDownload', textDownloadFilter)
  .directive('textDownload', textDownloadDirective)
  .name;
