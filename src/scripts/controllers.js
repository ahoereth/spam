'use strict';

var spamControllersMain = 'spam.controllers.main';
angular.module(spamControllersMain, []);



/**
 * CONTROLLER: Root
 */
angular.module(spamControllersMain).controller('Root', function(
	$rootScope,
	$scope,
	$log,
	$location,
	DataHandler,
	Courses,
	_
) {
	DataHandler.userInit();


	/**
	 * Adds a course to the curent user's planner.
	 *
	 * @param {int} courseId course_id database field
	 * @param {int} fieldId  field_id database field
	 */
	$scope.addCourse = function(studentInCourse, fieldId) {
		var courseId;

		// if first parameter is empty we wont be doing anything
		if (_.isUndefined(studentInCourse))
			return;

		// first parameter is the course_id;
		if (_.isNumber(studentInCourse)) {
			courseId = studentInCourse;
			studentInCourse = {
				course_id: courseId,
				field_id : ! _.isString(fieldId) ? fieldId : null
			};

		// got the whole course object as first parameter
		} else {
			courseId = studentInCourse.course_id;
		}

		var target = Courses.get($scope.user.getRegulation(), courseId);
		if (target)
			target.enrolled = true;

		$scope.user.all('courses').post(studentInCourse).then(function(course) {
			DataHandler.resetGuide();

			if (target)
				target.student_in_course_id = course.student_in_course_id;

			if ($rootScope.user.courses)
				$scope.user.courses.push(course);

			if (studentInCourse.course_id)
				$scope.$broadcast('courseAdded_' + studentInCourse.course_id, course);

			$scope.$broadcast('courseAdded', course);
			$log.info('Added: ' + course.course);
		});
	};


	/**
	 * Removes a course from the current user's planner.
	 *
	 * @param {int}    courseId course_id database field
	 * @param {object} course   object used for broadcasting
	 */
	$scope.removeCourse = function(course) {
		var target2 = _.findWhere($scope.user.courses, {student_in_course_id : course.student_in_course_id});
		$rootScope.user.courses = _.without($scope.user.courses, target2);

		var target = Courses.get($rootScope.user.getRegulation(), course.course_id);
		if (target)
			target.enrolled = false;

		$scope.user.one('courses', course.student_in_course_id).remove().then(function() {
			DataHandler.resetGuide();

			//Courses.unroll($rootScope.user.getRegulation(), course.course_id);
			if (target)
				target.student_in_course_id = null;

			$log.info('Removed: ' + course.course);
			$scope.$broadcast('courseRemoved', course);
			$scope.$broadcast('courseRemoved_'+course.course_id, course);
		}, function() {
			$log.info('Couldnt remove: ' + course.course);
			$rootScope.user.courses.push(target2);
		});
	};


	$scope.$on('userDestroy', function(event) {
		DataHandler.removeAll();
		DataHandler.userInit();
		$location.path('/');
	});


	$scope.$on('title', function(event, variables) {
		var title = angular.isDefined(variables.title) ? variables.title : $rootScope.title;

		angular.forEach(variables, function(value, key) {
			if (key.charAt(0) == ':') {
				title = title.replace(key, value);
			}
		});

		if ( title != '' ) {
			title += ' :: ';
		}

		$rootScope.title = title + 'Studyplanning in Cognitive Science';
	});


	$scope.$on('userUpdated', function(event, user) {
		angular.forEach(user, function(value, key) {
			$scope.user[key] = value;
		});
	});
});



/**
 * CONTROLLER: Login
 * ROUTE: /login
 *
 * Login page which can get passed a username parameter for prefilling the username form field.
 * Further more it reacts to some different errors.
 */
angular.module(spamControllersMain).controller('Login', function(
	$scope,
	$routeParams
) {

	$scope.params = $routeParams;

});


/**
 * CONTROLLER: Loginform
 *
 * Contains the loginform functionality which triggers authentication and redirects
 * appropriately.
 */
angular.module(spamControllersMain).controller('Loginform', function(
	$rootScope,
	$scope,
	$location,
	$routeParams,
	Auth
) {
	$rootScope.loginform = { username : $routeParams.username };

	/**
	 * User login
	 */
	$scope.login = function() {
		var t = this.loginform;
		t.loading = true;

		Auth.init(
			t.username,
			t.password,
			t.remember
		).then( function() {
			var targetRoute = _.isEmpty($rootScope.requested_route) ? '/~' : $rootScope.requested_route;
			$location.path(targetRoute).search({});
		}, function() {
			$location.path('/login').search({ username : t.username });
		});
	};
});


/**
 * CONTROLLER: Alert
 *
 * Just provides functionality for the alert close button
 */
angular.module(spamControllersMain).controller('Alert', function($scope) {

	/**
	 * Hides the alert
	 */
	$scope.closeAlert = function () {
		this.$parent.alert = false;
	};

});
