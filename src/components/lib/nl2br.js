import angular from 'angular';


function nl2brFilter() {
  return text => text.replace(/\n/g, '<br>');
}


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
