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
	User,
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
		$rootScope.loginform = { username : '' };
	};

	self.removeAll = function() {
		self.removeLogininfo();
		self.removeUserDependent();
	};

	self.userInit = function(data) {
		self.removeUserDependent();
		$rootScope.user = User(data);
	};

	return self;
}).



/**
 * User functionality factory. All functionality provided by this factory is
 * injected into the global ($rootScope) user object.
 */
factory('User', function(
	$rootScope,
	$log,
	Restangular,
	_
) {
	var methods = {};

	methods.updateUser = function(data) {
		var put = {};
		angular.forEach(data, function(value, key) {
			if ( ! angular.equals($rootScope.user[key], value) ) {
				put[key] = value;
			}
		});

		put.username = $rootScope.user.username;
		put = Restangular.restangularizeElement(null, put, 'users');

		put.put().then( function(user) {
			$rootScope.$broadcast('userUpdated', user);
			$log.info('User data saved.');
		});
	};

	methods.destroy = function() {
		$log.info('Destroying local user data.');
		$rootScope.$broadcast('userDestroy');
	};

	methods.deleteUser = function() {
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
			methods.destroy();
		}
	};

	methods.getRegulation = function(reg) {
		return this.regulation_id || (reg || null);
	};

	methods.getUsername = function() {
		return this.username || null;
	};


	return function(data) {
		if ( angular.isDefined(data) ) {
			if ( angular.isDefined(data.courses) )
				Restangular.restangularizeCollection(data, data.courses, 'courses');

			if ( angular.isDefined(data.fields) )
				Restangular.restangularizeCollection(data, data.fields, 'fields');

			data.thesis_grade = _.formatGrade(data.thesis_grade);
		}

		return angular.extend(methods, data, {loggedin : !_.isEmpty(data)});
	};
});
