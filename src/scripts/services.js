'use strict';

angular.module('services', []).


/**
 * User provider
 */
factory('TheUser', function(DataHandler, _) {
	var self = {}, data = {}, r;

	self.init = function(d) {
		data = d;
		r = _.extend(self, data);
	};

	self.unset = function() {
		data = {};
		r = self;
	};

	self.getData = function() {
		return data;
	};

	self.refreshData = function(updated) {
		self.unset();
		self.init(updated);
	};

	self.logout = function() {
		self.unset();
		DataHandler.removeAll();
	};

	self.getRegulation = function(useDefault) {
		return data.username ? data.regulation_id : ( useDefault ? 1 : undefined );
	};

	return r || self;
}).



/**
 * HTTP Authentication factory.
 */
factory('Auth', function(
	$rootScope,
	Base64,
	$http,
	$q,
	Restangular,
	DataHandler,
	TheUser
) {

	$rootScope.user = false;
	var username, promise;

	var getter = function () {
		promise = $q.defer();

		$http.defaults.headers.common['Authorization'] = 'Basic ' + DataHandler.getLogininfo('authdata');
		username = DataHandler.getLogininfo('username');

		if ( ! username ) {
			promise.resolve();
			return;
		}

		Restangular.one('users', username).get().then(function(user) {
			$rootScope.user = user;
			TheUser.init(user);

			promise.resolve();
		}, function() {
			logout();

			promise.resolve();
		});
	};

	var logout = function () {
		TheUser.logout();
		$rootScope.user = false;
		username = null;

		getter();
	};

	getter();

	return {
		setCrededentials: function (nick, password, useLocalStorage) {
			var encoded = Base64.encode(nick + ':' + password);
			DataHandler.updateLogininfo(nick, encoded, useLocalStorage);

			getter();
			return promise;
		},

		clearCredentials: function () {
			logout();
			return promise;
		},

		promise: function () {
			return promise;
		}
	};
}).
/*

factory('Rest', function(Restangular, _) {
	var self;

	return _.expand(Restangular, {
		unit: function(route, id, parent) {
			var obj;
			obj[route + '_id'] = id;
			return Restangular.restangularizeElement(null, , 'users').get().then(function(user) {
		}
	});
});*/

/**
 * UnderscoreJS
 */
factory('_', function ($window) {
	$window._.mixin( $window._.string.exports() );
	$window._.mixin({
		compactObject: function(to_clean) {
			$window._.map(to_clean, function(value, key, to_clean) {
				if ( !!!value || ($window._.isString(value) && $window._.trim(value).length === 0)) {
					delete to_clean[key];
				}
			});
			return to_clean;
		}
	});
	return $window._;
}).



/**
 * Base64 encoding for http authetication.
 */
factory('Base64', function () {
	var keyStr = 'ABCDEFGHIJKLMNOP' +
		'QRSTUVWXYZabcdef' +
		'ghijklmnopqrstuv' +
		'wxyz0123456789+/' +
		'=';

	return {
		encode: function (input) {
			var output = "";
			var chr1, chr2, chr3 = "";
			var enc1, enc2, enc3, enc4 = "";
			var i = 0;

			do {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output +
					keyStr.charAt(enc1) +
					keyStr.charAt(enc2) +
					keyStr.charAt(enc3) +
					keyStr.charAt(enc4);
				chr1 = chr2 = chr3 = "";
				enc1 = enc2 = enc3 = enc4 = "";
			} while (i < input.length);

			return output;
		},

		decode: function (input) {
			var output = "";
			var chr1, chr2, chr3 = "";
			var enc1, enc2, enc3, enc4 = "";
			var i = 0;

			// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
			var base64test = /[^A-Za-z0-9\+\/\=]/g;
			if (base64test.exec(input)) {
				alert("There were invalid base64 characters in the input text.\n" +
					"Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
					"Expect errors in decoding.");
			}
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			do {
				enc1 = keyStr.indexOf(input.charAt(i++));
				enc2 = keyStr.indexOf(input.charAt(i++));
				enc3 = keyStr.indexOf(input.charAt(i++));
				enc4 = keyStr.indexOf(input.charAt(i++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}

				chr1 = chr2 = chr3 = "";
				enc1 = enc2 = enc3 = enc4 = "";

			} while (i < input.length);

			return output;
		}
	};
});
