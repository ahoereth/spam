'use strict';

var spamFilters = 'spam.filters';
angular.module(spamFilters, []);



/**
 * FILTER: courseFilter
 */
angular.module(spamFilters).filter('courseFilter', function() {

	return function (array, obj) {
		var check = function(objKey, comp, value) {
			var text, key;

			if ( objKey.charAt(objKey.length-2) === '#' ) {
				key = objKey.slice(0,-2);
				text = (''+value[key]).replace(/[-_]/gi, ' ').toLowerCase();

				// equal
				if ( objKey.charAt(objKey.length-1) === '~' && text != comp )
					return false;

				// unequal
				else if ( objKey.charAt(objKey.length-1) === '!' && text === comp )
					return false;

				else if ( objKey.charAt(objKey.length-1) === '>' && text >= comp )
					return false;

				else if ( objKey.charAt(objKey.length-1) === '<' && text <= comp )
					return false;

			// contains
			} else {
				text = (''+value[objKey]).replace(/[-_]/gi, ' ').toLowerCase();
				if ( text.indexOf(comp) === -1 )
					return false;
			}

			return true;
		};

		var search = function(value) {
			for ( var objKey in obj) {
				var comp = (''+obj[objKey]), key = objKey;

				if ( objKey.indexOf('&&') !== -1 && comp.indexOf('&&') !== -1 ) {
					objKey = objKey.split('&&');
					comp = comp.split('&&');
				}

				if ( typeof objKey !== 'string' ) {
					for ( var i = 0; i < objKey.length; i++ ) {
						var c = comp[i].replace(/[-_]/gi, ' ').toLowerCase();
						if ( ! check(objKey[i], c, value) )
							return false;
					}
				} else {
					comp = comp.replace(/[-_]/gi, ' ').toLowerCase();
					if ( ! check(objKey, comp, value) )
						return false;
				}
			}

			return true;
		};

		var filtered = [];
		for ( var j = 0; j < array.length; j++ ) {
			if ( search( array[j] ) )
				filtered.push( array[j] );
		}
		return filtered;
	};

});



/**
 * FILTER: highlight
 *
 * Given a needle hightlights it (using <strong>) in the haystack.
 */
angular.module(spamFilters).filter('highlight', function() {

	return function (haystack, needle) {
		if ( ! haystack || ! needle ) return haystack;

		// remove all reserved characters from the needle
		needle = needle.toString().replace( /[\[\]\/\{\}\(\)\*\+\?\.\\\^\$|]/g, "\\$&" ); // but "-"

		// treat '-', '_' and ' ' as equal
		needle = needle.replace( /[-_ ]/g, '[_-\\s]' );

		return haystack.replace( new RegExp(needle, 'gi'), '<strong>$&</strong>' );
	};

});



/**
 * FILTER: nl2br
 *
 * Converts all line breaks to actual html break line tags.
 */
angular.module(spamFilters).filter('nl2br', function() {

	return function(text) {
		return text.replace(/\n/g, '<br>');
	};

});




/**
 * FILTER: year
 *
 * Converts a given 4 digit year to it's 2 digit equivalent.
 */
angular.module(spamFilters).filter('year', function() {

	return function(year) {
		return ( "0" + year % 100).slice(-2);
	};

});



/**
 * FILTER: iif
 *
 * Inline conditionals from http://stackoverflow.com/a/14165488/1447384
 */
angular.module(spamFilters).filter('iif', function() {

	return function(input, trueValue, falseValue) {
		return input ? trueValue : falseValue;
	};

});



/**
 * FILTER: urlencode
 *
 * Inline conditionals from http://stackoverflow.com/a/14165488/1447384
 */
angular.module(spamFilters).filter('urlencode', function($window) {

	return function(unencoded) {
		return $window.encodeURIComponent(unencoded);
	};

});



/**
 * FILTER: prerequisites
 *
 * Parse a course's description text for prerequisits and make them hyperlinks.
 */
angular.module(spamFilters).filter('prerequisites', function(
	$sce,
	_
) {

	// used for caching the trusted strings
	var trusted = {};

	return function (haystack) {
		if ( haystack === null )
			return haystack;

		var output = '', regex = /(?:(Prerequisites:) ?(.*)\n?)?([\S\s]*)?/ig;

		var result = regex.exec( haystack );
		if ( typeof result[1] !== 'undefined' ) {
			output += '<p><strong>'+result[1]+'</strong>&nbsp;';

			if ( typeof result[2] !== 'undefined' ) {

				// split string in single prerequisite and walk over them
				result[2] = result[2].split(',');
				_.each( result[2], function( prerequisite, k ) {

					// remove stuff and generate link
					prerequisite = _.trim( prerequisite, ' .' );
					output += '<a href="courses?title=' + encodeURIComponent( prerequisite ) + '">' + prerequisite + '</a>';

					// add comma if there are more prerequisites
					if ( result[2].length > k + 1 )
						output += ',&nbsp;';
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

});
