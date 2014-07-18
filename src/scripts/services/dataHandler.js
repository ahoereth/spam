/**
 * Wrapper for handling all data, storage and caching related stuff.
 *
 * TODO: Documentation
 */
angular.module('services.dataHandler', []).factory('DataHandler', function(
	$rootScope,
	$cacheFactory,
	Courses,
	TheUser
) {
	var webstorage = ( typeof( Storage ) !== "undefined" ) ? true : false;
	var self = {};

	var logininfo = {
		username : webstorage ? localStorage.getItem('username') || sessionStorage.getItem('username') : null,
		authdata : webstorage ? sessionStorage.getItem('authdata') || localStorage.getItem('authdata') : null
	};

	self.getLogininfo = function(key) {
		return logininfo[key];
	};

	self.updateLogininfo = function(username, authdata, useLocalStorage) {
		logininfo = {
			username : username,
			authdata : authdata
		};

		if ( webstorage ) {
			if ( useLocalStorage ) {
				localStorage.setItem('authdata', authdata);
				localStorage.setItem('username', username);
			} else {
				sessionStorage.setItem('authdata', authdata);
				sessionStorage.setItem('username', username);
			}
		}
	};

	self.removeLogininfo = function() {
		logininfo = {};
		document.execCommand("ClearAuthenticationCache");
		if ( webstorage ) {
			sessionStorage.removeItem('authdata');
			sessionStorage.removeItem('username');
			localStorage.removeItem('authdata');
			localStorage.removeItem('username');
		}
		TheUser.unset();
	};

	self.resetGuide = function() {
		var guide = $cacheFactory.get('guide');
		if ( guide ) guide.removeAll();
	};

	self.removeUserDependent = function() {
		self.resetGuide();
		Courses.reset();
		$rootScope.studentCourses = {};
		$rootScope.loginform = { username : '' };
	};

	self.removeAll = function() {
		self.removeLogininfo();
		self.removeUserDependent();
	};

	return self;
});
