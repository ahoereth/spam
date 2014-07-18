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

	self.loggedIn = function() {
		return !_.isEmpty(data.username);
	};

	self.logout = function() {
		self.unset();
		DataHandler.removeAll();
	};

	self.getRegulation = function(useDefault) {
		return data.username ? data.regulation_id : ( useDefault ? 1 : undefined );
	};

	self.getUsername = function() {
		return data.username || null;
	};

	self.getRank = function() {
		return data.rank || null;
	};

	self.courses = null;
	self.getCourses = function() {
		// if are not/have not yet pulled the courses, do so
		if (_.isEmpty(self.courses))
			self.courses = self.getList('courses');

		// return the promise which might already contain the courses
		return self.courses;
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
	TheUser,
	_
) {
	var deferredLogin = 'not_initiated';

	$rootScope.user = false;

	var login = function () {
		deferredLogin = $q.defer();

		var username = DataHandler.getLogininfo('username');
		$http.defaults.headers.common['Authorization'] = 'Basic ' + DataHandler.getLogininfo('authdata');

		if (!_.isEmpty(username)) {
			Restangular.one('users', username).get().then(function(user) {
				TheUser.init(user);
				deferredLogin.resolve(TheUser);
			}, function() {
				TheUser.logout();
				deferredLogin.reject();
			});
		} else {
			deferredLogin.reject();
		}

		return deferredLogin.promise;
	};

	// Initiate the login process as early as possible so we do not have to start
	// it when a controller is initiated. No matter what page the user is viewing,
	// we are interested in if he is logged in or not.
	login();

	return {
		init: function (nick, password, useLocalStorage) {
			var encoded = Base64.encode(nick + ':' + password);
			DataHandler.updateLogininfo(nick, encoded, useLocalStorage);
			return login();
		},


		authenticate: function (accessSet) {
			var loginPromise, deferredAuthentication = $q.defer();

			if ('not_initiated' == deferredLogin) {
				// Login process was not initiated yet, do so
				loginPromise = login();

			} else {
				// Login process was initiated before, get the promise
				loginPromise = deferredLogin.promise;
			}

			if (accessSet === 0) {
				// accessSet is 0, therefore everybody is legitimated to view this site
				deferredAuthentication.resolve(TheUser);

			} else {
				// accessSet is something more specific, therefore we need to check
				// the user information (after the login promise is fulfilled)

				// when login was successful
				loginPromise.then(function() {
					// Login was successful.

					if (
						// accessSet is a explicit user rank integer and the users rank is
						// equal or higher
						(_.isNumber(accessSet) && accessSet <= TheUser.getRank()) ||

						// The user himself is allowed to see this route, we will
						// only retrieve data related to him
						(! _.isUndefined(accessSet['self'])) ||

						// The user is explicitly named in the accessSet, so he is allowed
						// to view this route as well
						(!_.isUndefined(accessSet[TheUser.getUsername()]))
					) {
						deferredAuthentication.resolve(TheUser);

					} else {
						// Could not match the accessSet to the current user, reject
						// the authentication request
						deferredAuthentication.reject('not_authenticated');
					}

				}, function() {
					// Login was not successful. User is certainly not allowed to see
					// this page, because we already checked accessSet === 0

					// Reject authentication request
					deferredAuthentication.reject('not_authenticated');
				});
			}

			// return the authentication promise
			return deferredAuthentication.promise;
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
