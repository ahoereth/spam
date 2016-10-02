import angular from 'angular';


/**
 * MODULE: nl2brFilter
 * FILTER: nl2br
 *
 * Converts all line breaks to actual html break tags.
 */
export default angular
  .module('nl2brFilter', [])
  .filter('nl2br', nl2brFilter)
  .name;




/* @ngInject */
function nl2brFilter() {
  return function(text) {
    return text.replace(/\n/g, '<br>');
  };
}
