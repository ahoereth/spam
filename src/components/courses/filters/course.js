import angular from 'angular';


function courseFilter() {
  return (data, obj) => {
    const filters = [];
    let k, c, index;

    if (angular.equals(obj, {})) {
      return data;
    }

    // check a value against a term using a comparator
    const check = (term, comparator, value) => {
      term = term.replace(/[- ]/g, '_');

      if (comparator === '>' && term < value) {
        return false;
      } else if (comparator === '<' && term > value) {
        return false;
      } else if (comparator === '=' && !angular.equals(term, value)) {
        return false;
      } else if (comparator === '!' && angular.equals(term, value)) {
        return false;
      } else if ((comparator === null || comparator === '~') && value.indexOf(term) === -1) {
        return false;
      }

      return true;
    };


    const search = dataObject => {
      // for every filter item
      for (let i = filters.length - 1, f, t; i >= 0; i--) {
        f = filters[i];
        t = String(dataObject[f.key]).replace(/[- ]/g, '_').toLowerCase();

        if (!check(f.value, f.comparator, t)) {
          return false;
        }
      }

      return true;
    };

    // clean up the filters
    angular.forEach(obj, (value, key) => {
      if (key.indexOf('&&') !== -1 && value.indexOf('&&') !== -1) {
        key = key.split('&&');
        value = value.split('&&');
      } else {
        key = [key];
        value = [value];
      }

      for (let i = 0; i < key.length; i++) {
        c = null;
        k = key[i];
        index = k.lastIndexOf('#');

        if (index !== -1) {
          k = key[i].slice(0, index);
          c = key[i].slice(index + 1);
        }

        filters.push({
          key: String(k).toLowerCase(),
          value: String(value[i]).toLowerCase(),
          comparator: c,
        });
      }
    });

    // for every data item
    const filtered = [];
    for (let j = 0; j < data.length; j++) {
      if (search(data[j])) {
        filtered.push(data[j]);
      }
    }
    return filtered;
  };
}


/**
 * MODULE: spam.courses.filters.course
 * FILTER: courseFilter
 */
export default angular
  .module('spam.courses.filters.course', [])
  .filter('courseFilter', courseFilter)
  .name;
