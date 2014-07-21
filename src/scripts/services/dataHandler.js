/**
 * Wrapper for handling all data, storage and caching related stuff.
 *
 * TODO: Documentation
 */
angular.module('services.dataHandler', []).factory('DataHandler', function(
	$rootScope,
	$cacheFactory,
	$log,
	Courses,
	_
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


	var user = {}
	user.getCourses = function() {
		// if are not/have not yet pulled the courses, do so
		if (_.isEmpty($rootScope.user.courses)) {
			$rootScope.user.courses = $rootScope.user.getList('courses');
		}

		// return the promise which might already contain the courses
		return $rootScope.user.courses;
	};

	user.save = function(user) {
		$log.info('Saving local user data to global.');
		$rootScope.user.put().then(function(result) {
			$log.info('User data saved.');
		}, function() {
			$log.info('Error while saving user data.');
		});
	};

	user.destroy = function() {
		$log.info('Destroying local user data.');
		$rootScope.$broadcast('userDestroy');
		self.removeAll();
	};

	user.delete = function() {
		$log.info('Deleting global user data.');
		//$rootScope.$broadcast('userDelete');
		if ($rootScope.user) {
			$rootScope.user.remove().then(function() {
				// notify client that deletion was successful
				$log.info('Global user data deleted.');
			}, function() {
				// do something when removing fails
				$log.info('Error while deleting global user data.');
			});

			// handle local and global user data deletion asynchronously
			user.destroy();
		}
	};

	user.getRegulation = function(reg) {
		return user.regulation_id || (reg || null);
	};

	user.getUsername = function() {
		return user.username || null;
	};

	self.userInit = function(data) {
		$rootScope.user = angular.extend(user, data, {loggedin : !_.isEmpty(data)});
	}

	return self;
});
