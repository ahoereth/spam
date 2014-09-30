var spamControllersHome = 'spam.controllers.home';
angular.module(spamControllersHome, [ 'services.transcript' ]);



/**
 * CONTROLLER: Home
 * ROUTE: /~
 *
 * TODO: this needs massive cleanup and optimization
 */
angular.module(spamControllersHome).controller('Home', function(
	$rootScope,
	$scope,
	$timeout,
	$route,
	$cacheFactory,
	$location,
	$log,
	$q,
	_,
	Restangular,
	Transcript
) {
	$scope.fieldGradeInit = function() {
		var field = this.field;

		field.auto_grade = ! field.auto_grade;
		field.grade = null;

		if ( field.auto_grade ) {
			field.put();
			Transcript.field_changed( field );
		}
	};


	/**
	 * Student in field grade edited. Redo some calculations and save the
	 * changes to the server.
	 */
	$scope.editFieldGrade = function( field ) {
		field = this.field || field;
		field.grade = _.formatGrade( field.grade );

		if ( field.grade == field.old_grade ) {
			return;
		}

		field.put();
		field.old_grade = field.grade;
		Transcript.field_changed( field );
	};


	/**
	 * Called when some student in course property changed.
	 *
	 * @param course course the course which properties has changed
	 */
	$scope.editProp = function(course) {
		course = course || this.course;
		Transcript.course_put(course);
	};


	/**
	 * TODO
	 */
	$scope.updateThesis = function() {
		var user = $scope.user;
		user.thesis_grade = _.formatGrade(user.thesis_grade);

		if ( user.thesis_title_old == user.thesis_title && user.thesis_grade_old == user.thesis_grade )
			return;

		Transcript.facts_changed();

		// remember old stuff
		user.thesis_title_old = user.thesis_title;
		user.thesis_grade_old = user.thesis_grade;

		$scope.user.one('regulations', user.regulation_id).customPUT({
			title: user.thesis_title,
			grade: user.thesis_grade
		}).then(function(t) {
			$log.info('Student thesis updated: ' + user.thesis_title + ' - ' + user.thesis_grade);
		});
	};
	$scope.thesis_active = $scope.user.thesis_title || $scope.user.thesis_grade ? true : false;


	/**
	 * Function to give the user a headstart and add the guide courses for his
	 * first semester.
	 */
	$scope.headstart = function() {
		Restangular.one( 'guides', 1 ).getList( 'courses', {
			semester : 1,
			year     : $scope.user.mat_year,
			term     : $scope.user.mat_term
		}).then(function(guide) {
			_.each(guide, function(course, idx) {
				$scope.addCourse(course.course_id, course.fields[0].field_id);
			});
		});
	};


	/**
	 * Moves a specific course to a different field. Student in course data.
	 */
	$scope.moveCourse = function( newFieldId ) {
		var c = this.course;
		var target = _.findWhere( $scope.user.courses, { student_in_course_id : c.student_in_course_id } );
		target.enrolled_field_id = ! _.isNull(newFieldId) ? newFieldId : 1;

		$scope.editProp(target);
	};


	/**
	 * Blur the grade input field when the user presses the enter key.
	 */
	$scope.blurOnEnter = function( $event ) {
		if ( $event.keyCode != 13 ) return;
		$timeout( function () { $event.target.blur(); }, 0, false);
	};


	/**
	 * Get a specific field by its field_id
	 * @param  {int} i field_id
	 * @return {field} field
	 */
	$scope.getFieldById = function(i) {
		return _.find( $rootScope.fields, { field_id : parseInt(i, 10) } );
	};


	/**
	 * Listen for the courseAdded event. If it occurs add the course to
	 * the user's course array.
	 */
	$scope.$on( 'courseAdded', function(event, course) {
		Transcript.course_put(course);
	});


	/**
	 * Listen for the courseRemoved event.
	 */
	$scope.$on( 'courseRemoved', function(event, course) {
		Transcript.course_removed(course);
	});

	var pointers = Transcript.init($scope.user);
	$scope.fields  = pointers.fields;
	$scope.terms   = pointers.terms;
	$scope.facts   = pointers.facts;
	$scope.columns = pointers.columns;
});



/**
 * CONTROLLER: Logout
 * ROUTE: /~/logout
 */
angular.module(spamControllersHome).controller('Logout', function(
	$scope,
	$location
) {
	$scope.user.destroy();
	$location.path('/login').search( { loggedout : true } ).replace();
});



/**
 * CONTROLLER: UserSettings
 * ROUTE: /~/settings
 */
angular.module(spamControllersHome).controller('UserSettings', function(
	$rootScope,
	$scope,
	$location,
	$timeout,
	$log,
	Restangular
) {
	var timer = null, last;

	$scope.user = {
		firstname      : $rootScope.user.firstname,
		lastname       : $rootScope.user.lastname,
		mat_year       : $rootScope.user.mat_year,
		mat_term       : $rootScope.user.mat_term,
		regulation_abbr: $rootScope.user.regulation_abbr
	};

	last = angular.copy($scope.user);

	$scope.$watch('user', function(next, current) {
		if ( angular.equals(next, current) )
			return;

		$timeout.cancel(timer);
		timer = $timeout( $scope.updateUser, 250 );
	}, true);

	$scope.updateUser = function() {
		if ( angular.equals( $scope.user, last ) )
			return;

		lastState = angular.copy( $scope.user );

		$rootScope.user.updateUser($scope.user);
	};

	$scope.deleteUser = function() {
		$rootScope.user.deleteUser();
	};

});


/**
 * CONTROLLER: UserMatVerify
 * ROUTES: /~
 *         /~/settings
 */
angular.module(spamControllersHome).controller('UserMatVerify', function(
	$scope,
	$log,
	DataHandler,
	_
) {
	var currentYear = new Date().getFullYear();
	$scope.years = _.range(currentYear, currentYear-3, -1);

	$scope.verify = {
		mat_year   : ! _.isEmpty($scope.user.mat_year) ? $scope.user.mat_year : currentYear,
		mat_term   : ! _.isEmpty($scope.user.mat_term) ? $scope.user.mat_term : 'W',
		mat_verify : 0
	};

	$scope.doVerify = function() {
		$scope.verify.mat_verify = 1;
		$scope.user.updateUser($scope.verify);
	};
});



/**
 * TODO
 */
angular.module(spamControllersHome).controller('Unofficial_edit', function(
	$rootScope,
	$scope,
	$location,
	$routeParams,
	Restangular,
	_
) {

	$scope.fields = Restangular.all( 'fields' ).getList( {
		regulation_id : $scope.user.regulation_id
	} ).$object;

	$scope.course = {
		field_id : parseInt( $routeParams.field_id, 10 ),
		unofficial_year: $rootScope.meta.year,
		unofficial_term: $rootScope.meta.term
	};

	/**
	 * Adds an unofficial course to the user's course collection.
	 *
	 * @param course object
	 *     unofficial_code
	 *     unofficial_course
	 *     unofficial_ects
	 *     unofficial_semester
	 */
	$scope.submit = function() {
		$scope.submitted = true;

		var course = this.course;

		if ( _.isUndefined(course) || _.isEmpty(course.unofficial_course) ) return;

		$scope.addCourse(course);

		var added = $scope.$on( 'courseAdded', function(event, course) {
			$scope.submitted = false;
			$location.search({}).path('/~');

			added();
		});
	};

});
