(function() {
  'use strict';

  /**
   * MODULE: spam.courses.filters.course
   * FILTER: courseFilter
   */
  angular
    .module('spam.courses.filters.course', [])
    .filter('courseFilter', courseFilter);




  /* @ngInject */
  function courseFilter() {
    return function (data, obj) {
      var filters = [], k, c, index;

      if (angular.equals(obj, {})) {
        return data;
      }

      // check a value against a term using a comparator
      var check = function(term, comparator, value) {
        term = term.replace( /[- ]/g, '_' );

        if (comparator === '>' && term < value) {
          return false;

        } else if (comparator === '<' && term > value) {
          return false;

        } else if (comparator === '=' && ! angular.equals(term, value)) {
          return false;

        } else if (comparator === '!' && angular.equals(term, value)) {
          return false;

        } else if ((comparator === null || comparator === '~') && value.indexOf(term) === -1) {
          return false;
        }

        return true;
      };


      var search = function(dataObject) {
        // for every filter item
        for ( var i = filters.length - 1, f, t; i >= 0; i-- ) {
          f = filters[ i ];
          t = ( '' + dataObject[ f.key ] ).replace( /[- ]/g, '_' ).toLowerCase();

          if ( ! check( f.value, f.comparator, t ) ) {
            return false;
          }
        }

        return true;
      };

      // clean up the filters
      angular.forEach(obj, function(value, key) {
        if ( key.indexOf('&&') !== -1 && value.indexOf('&&') !== -1 ) {
          key   = key.split('&&');
          value = value.split('&&');
        } else {
          key   = [key];
          value = [value];
        }

        for (var i = 0; i < key.length; i++) {
          c = null;
          k = key[i];
          index = k.lastIndexOf('#');

          if (index !== -1) {
            k = key[i].slice(0,index);
            c = key[i].slice(index+1);
          }

          filters.push({
            key: (''+k).toLowerCase(),
            value: (''+value[i]).toLowerCase(),
            comparator: c
          });
        }
      });

      // for every data item
      var filtered = [];
      for (var j = 0; j < data.length; j++) {
        if (search( data[j])) {
          filtered.push(data[j]);
        }
      }
      return filtered;
    };
  }

})();
