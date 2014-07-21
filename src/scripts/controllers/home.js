var spamControllersHome = 'spam.controllers.home';
angular.module(spamControllersHome, []);



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
	Restangular
) {

	var promises = {};

	$scope.courses_by_fields = {};
	$scope.fieldsRange = [];

	/**
	 * Generate all information about the current state of the user's study plan.
	 *
	 * This includes all field and overall grade and ects calculations but also the
	 * grouping of courses to their assigned field for the overview page.
	 *
	 * @param  {boolean} regroup pass true to force regrouping - regrouping is not
	 *                           required when for example only recalculating grades
	 */
	var generateCourseMeta = function(regroup) {
		if ( _.isEmpty($rootScope.fields) )
			return false;

		var data = {
			averaging_ects : 0,
		};

		// initiate all required overview scope variables
		_.extend( $scope, {
			enrolled_ects : 0, // ects of all courses without muted
			completed_course_ects : 0, // passed ects of the above
			average_grade : 0, // average grade in those passed ects
			terms : {}, // reset all terms
			bsc_relevant_fields : [],
			bachelor_grade : 0,
			bachelor_grade_ects : 0,
			columns : $scope.columns || [[], [], []]
		});

		// regroup the courses to their assigned field?
		if ( _.isEmpty( $scope.courses_by_fields ) || regroup ) {
			$scope.courses_by_fields = _.groupBy( $scope.user.courses, 'enrolled_field_id' );
			$scope.columns = [[], [], []];
		}

		// build the three layout columns so they are equally sized
		if ( ! $scope.columns[0].length )
			$scope.columns = buildColumns($rootScope.fields, $scope.courses_by_fields);

		// iterate over all fields
		_.each($rootScope.fields, function(field) {

			// extend the field with some variables later required on the front end
			_.extend( field, {
				completed_ects : 0,                                //    completed ects
				enrolled_ects  : 0,                                //  + enrolled ects
				required_ects  : field.field_pm,                   //  + required ects
				ects           : field.field_pm + field.field_wpm, // <= field's ects
				grade          : formatGrade( field.grade ),
				average_grade  : 0, // calculated from the courses

				// use average_grade as grade
				auto_grade     : field.auto_grade || _.isNull( field.grade ),

				// used for not updating the database when actually nothing changed
				old_grade      : formatGrade( field.grade ),
			});

			// some variables only required for calculations on the backend
			var fieldData = {
				courses : 0,
				averaging_ects : 0
			};

			// sort courses in the current field by year/term/title
			$scope.courses_by_fields[field.field_id] = _.sortBy( $scope.courses_by_fields[field.field_id], function(course) {
				return course.year + course.term + course.course;
			});

			// iterate over all courses in the current field
			_.each( $scope.courses_by_fields[field.field_id], function(course, idx) {
				fieldData.courses++;

				course.grade     = formatGrade( course.grade );
				course.old_grade = course.grade;
				course.doesnt_count = false;
				course.counts_only_partially = false;

				var abbr = course.term + course.year;

				// does the current term already contain some data? if not create it
				if ( _.isUndefined( $scope.terms[ abbr ] ) ) {
					$scope.terms[ abbr ] = {
						sort : course.year + course.term,
						abbr : abbr,
						term : course.term,
						year : course.year,
						grade : 0,
						ects : 0,
						completed_ects : 0,
						completed_courses : 0,
						averaging_ects : 0,
						courses : []
					};
				}

				// remember current term
				var term = $scope.terms[ abbr ];

				// save data to the array containing all terms,
				// required for an term view and some term specific numbers
				term.ects += course.ects;
				term.courses.push(course);

				// has the course been muted manually?
				if ( ! course.muted ) {

					field.full_ects = field.completed_ects + field.enrolled_ects;

					// does the user still require ects for the PM part of this field?
					if ( field.required_ects > 0 && course.enrolled_course_in_field_type == 'PM' )
						field.required_ects = field.required_ects >= course.ects ? field.required_ects - course.ects : 0;

					// passed this course?
					if ( course.passed ) {

						$scope.completed_courses++;

						// to which amount does this course count? maybe the field is
						// already satisfied partially or completely
						var courseEctsOfInterest = ( field.ects - field.completed_ects ) >= course.ects ? course.ects : field.ects - field.completed_ects;

						// course counts at least partially and field is not already full
						// because of completed and/or enrolled courses
						if ( courseEctsOfInterest > 0 && (field.ects - field.full_ects) > 0 ) {

							// course counts only partially
							if ( courseEctsOfInterest != course.ects )
								course.counts_only_partially = true;

							field.completed_ects += courseEctsOfInterest;
							term.completed_ects  += courseEctsOfInterest;

							// not just "passed", but passed with grade?
							if ( course.grade ) {
								data.averaging_ects  += courseEctsOfInterest;
								$scope.average_grade += courseEctsOfInterest * course.grade;

								fieldData.averaging_ects += courseEctsOfInterest;
								field.average_grade      += courseEctsOfInterest * course.grade;

								term.averaging_ects += courseEctsOfInterest;
								term.grade          += courseEctsOfInterest * course.grade;
							}

						// course does not count because the field is full
						} else {
							course.doesnt_count = true;
						}

					// course not passed but also not failed?
					} else if ( course.grade != 5 ) {
						// are there any spare credits so enrolling in the course is worth it?
						var spareCredits = field.ects - (field.full_ects + field.required_ects);
						if ( spareCredits > 0 && (field.ects - field.full_ects) > 0 ) {
							field.enrolled_ects = spareCredits >= course.ects ?
								field.enrolled_ects + course.ects :
								field.enrolled_ects + spareCredits;
						} else {
							course.doesnt_count = true;
						}
					}

				}
			});

			field.average_grade   = fieldData.averaging_ects === 0 ? '' : formatGrade( field.average_grade / fieldData.averaging_ects );
			field.grade           = field.auto_grade ? field.average_grade : field.grade;

			$scope.completed_course_ects += field.completed_ects;
			$scope.enrolled_ects  += field.enrolled_ects;

			field.open_ects = field.ects - ( field.completed_ects + field.enrolled_ects + field.required_ects );

			field.open_ects_percent      = percent(field.open_ects, field.ects);
			field.completed_ects_percent = percent(field.completed_ects, field.ects);
			field.enrolled_ects_percent  = percent(field.enrolled_ects, field.ects);
			field.required_ects_percent  = percent(field.required_ects, field.ects);

			// field completed and not open studies, statistics or logic
			if ( field.completed_ects_percent == 100 && -1 === _.indexOf( [1, 2, 3], field.field_id ) ) {
				$scope.bsc_relevant_fields.push( field );
			}
		});

		$scope.completed_ects = $scope.completed_course_ects;

		// calculate bachelor grade
		// TODO: move bachelor thesis ects to database!!! => regulations
		// TODO: module/field examinations give ECTS!
		$scope.thesis = {
			thesis_ects : _.isUndefined( $scope.user.thesis_ects ) ? 12 : $scope.user.thesis_ects
		};

		if ( ! _.isEmpty( $scope.user.thesis_grade ) ) {
			$scope.average_grade += $scope.user.thesis_grade * thesis.thesis_ects;
			data.averaging_ects += thesis.thesis_ects;
			$scope.completed_ects += thesis.thesis_ects;

			$scope.bachelor_grade += thesis.thesis_grade * thesis.thesis_ects;
			$scope.bachelor_grade_ects += thesis.thesis_ects;
		}

		// calculate the overall average grade
		$scope.average_grade = formatGrade( $scope.average_grade / data.averaging_ects );

		// format all term average grades
		_.each( $scope.terms, function( term ) {
			term.grade = formatGrade( term.grade / term.averaging_ects );
		});

		// get some specific terms which we currently want to show on the front-end
		$scope.lastSemester    = _.findWhere( $scope.terms, { term : $rootScope.meta.otherTerm, year : $rootScope.meta.lastTermYear } );
		$scope.currentSemester = _.findWhere( $scope.terms, { term : $rootScope.meta.term,      year : $rootScope.meta.currentTermYear } );
		$scope.nextSemester    = _.findWhere( $scope.terms, { term : $rootScope.meta.otherTerm, year : $rootScope.meta.nextTermYear } );

		// get the 5 best relevant fields
		$scope.bsc_relevant_fields = _.sortBy( $scope.bsc_relevant_fields, 'grade' );
		$scope.bsc_relevant_fields = $scope.bsc_relevant_fields.slice(0,5);

		// calculate the bachelor grade
		_.each( $scope.bsc_relevant_fields, function(field) {
			field.bsc_relevant = true;

			$scope.bachelor_grade += parseFloat( field.grade ) * field.completed_ects;
			$scope.bachelor_grade_ects += field.completed_ects;
		});
		$scope.bachelor_grade = formatGrade( $scope.bachelor_grade / $scope.bachelor_grade_ects );
	};


	$scope.fieldGradeInit = function() {
		var field = this.field;
		field.auto_grade = ! field.auto_grade;
		field.grade = '';

		$scope.editFieldGrade(field);

		if ( field.auto_grade )
			generateCourseMeta();
	};


	/**
	 * Student in field grade edited. Redo some calculations and save the
	 * changes to the server.
	 *
	 * TODO: Do we need to clean some cache data here?
	 */
	$scope.editFieldGrade = function(field) {
		field = this.field || field;
		var grade = formatGrade( field.grade );

		if ( grade == field.old_grade ) return;

		field.old_grade = formatGrade( grade );

		field.post().then(function(studentInField) {
			$log.info( 'Student in field grade updated: ' + field.field + ' - ' + field.grade );

			generateCourseMeta();
		});
	};


	/**
	 * Student in course grade changed.
	 *
	 * @uses $scope.editProp for saving the changed grade
	 */
	$scope.editGrade = function() {
		this.course.grade = formatGrade( this.course.grade );
		var course = this.course;

		// dont make a http request if nothing has changed
		if ( angular.equals( course.old_grade, course.grade ) || ( ! course.old_grade && ! course.grade ) )
			return;

		$scope.editProp( course );
	};


	/**
	 * Called when some student in course property changed. Saves the changes
	 * to the server and regenerates the meta data.
	 *
	 * TODO: Is clearing the cache required?
	 *
	 * @param course course the course which properties has changed
	 */
	$scope.editProp = function(course) {
		course = _.isNull(course) ? this.course : course;

		// TODO: remove this with an restangular update
		course.id = course.student_in_course_id;
		course.put().then(function(c) {
			// remember new old grade
			course.old_grade = course.grade;

			// maybe the server had something to say about those?
			course.passed    = c.passed;
			course.grade     = c.grade;
			course.muted     = c.muted;

			$log.info( "Student in course poperty changed: " + course.course );
			generateCourseMeta();
		});
	};


	/**
	 * TODO
	 */
	$scope.updateThesis = function() {
		var user = $scope.user;
		user.thesis_grade = formatGrade( user.thesis_grade, true );

		if ( user.thesis_title_old == user.thesis_title && user.thesis_grade_old == user.thesis_grade )
			return;

		$scope.user.one('regulations',user.regulation_id).customPUT({
			title: user.thesis_title,
			grade: user.thesis_grade
		}).then(function(t) {
			$log.info('Student thesis updated: ' + user.thesis_title + ' - ' + user.thesis_grade);

			// remember old stuff
			user.thesis_title_old = user.thesis_title;
			user.thesis_grade_old = user.thesis_grade;

			generateCourseMeta();
		});
	};
	$scope.thesis_active = $scope.user.thesis_title || $scope.user.thesis_grade ? true : false;


	/**
	 * Function to give the user a headstart and add the guide courses for his
	 * first semester.
	 */
	$scope.headstart = function() {
		Restangular.one( 'guide' ).getList(1, {
			semester : 1,
			year     : $scope.user.mat_year,
			term     : $scope.user.mat_term
		}).then(function(guide) {
			_.each(guide, function(course, idx) {
				$rootScope.addCourse(course.course_id,course.fields[0].field_id);
			});
		});
	};


	/**
	 * Format a given string to a grade.
	 *
	 * Legal grades: [1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0 5.0]
	 * Everything below 1 will be formated to an empty string, everything above 5 to 5.0.
	 * commas are swapped with periods, all non numerical characters are stripped.
	 *
	 * @param  float v any string
	 * @return float grade
	 */
	var formatGrade = function( v, onlyPassed ) {
		if ( v === null ) return '';

		v = v + '';
		v = v.replace( ',', '.' ).replace( /[^\d\.]/g, "" );
		if ( isNaN( v = Math.round( parseFloat( v ) * 10) / 10 ) ) return '';
		v = v < 1 ? "0.0" : ( v > 4 ? "5.0" : v + '' );
		if ( v.indexOf('.') == -1 ) v += '.';
		if ( v.length < 3 )         v += '0';

		var f = v[0];
		var l = v[v.length-1];
		if      ( l <= 1           ) l = 0;
		else if ( l >= 2 && l <= 4 ) l = 3;
		else if ( l >= 5 && l <= 8 ) l = 7;
		else                       { l = 0; f++; }

		v = f + '.' + l;

		if ( v == '0.0' )
			v = '';

		if ( onlyPassed && v == '5.0' )
			v = '';

		return v;
	};

	$scope.formatGrade = formatGrade;

	var percent = function(a, b) {
		return a / b * 100;
	};


	/**
	 * Generates an array of 3 objects from all fields.
	 * Fields are distributed between the 3 objects so that in the end the printed
	 * columns should have similar height.
	 *
	 * @param  {object} fields
	 * @param  {object} courses_by_fields
	 * @return {array}  columns
	 */
	var buildColumns = function(fields, courses_by_fields) {
		var order = [
				{idx: 0, val: 0, fields: 0},
				{idx: 1, val: 0, fields: 0},
				{idx: 2, val: 0, fields: 0}
			],
			added = [],
			columns = [[], [], []];

		// run through all fields which already contain courses
		if ( courses_by_fields.length > 0 ) {
			_.each( courses_by_fields, function( field, idx ) {
				columns[ order[0].idx ].push( idx ); // add field to row
				added.push( idx ); // add field to row
				order[0].val += field.length; // remember how many courses we just added
				order[0].fields++; // remember how many fields we added to this row
				order = _.sortBy( order, ['fields', 'val'] ); // reorder the three columns
			});
		}

		// are there any empty fields? add those as well to the columns
		if ( added.length != fields.length ) {
			_.each( fields, function( field, idx ) {
				if ( -1 === _.indexOf( added, (''+field.field_id) ) ) {
					columns[ order[0].idx ].push( field.field_id ); // add field to row
					order[0].val += field.length; // remember how many courses we just added
					order[0].fields++; // remember how many fields we added to this row
					order = _.sortBy( order, ['fields', 'val'] ); // reorder the three columns
				}
			});
		}

		return columns.reverse();
	};


	/**
	 * Moves a specific course to a different field. Student in course data.
	 */
	$scope.moveCourse = function( newFieldId ) {
		var c = this.course;

		var target = _.findWhere( $scope.user.courses, { student_in_course_id : c.student_in_course_id } );
		target.enrolled_field_id = ( newFieldId == 'null' ? 1 : newFieldId );
		generateCourseMeta(true);

		// TODO: change this when restangular is updated...
		// TODO: update route to not contain fields
		this.course.id = this.course.student_in_course_id;
		this.course.one('fields',newFieldId).put().then(function(courseInField) {
			target.enrolled_course_in_field_type = courseInField.enrolled_course_in_field_type;

			$log.info( 'Moved: ' + target.course );
			generateCourseMeta( true );
		});
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


	// generate course meta after querying fields
	if (_.isEmpty($rootScope.fields)) {
		$scope.user.getList('fields').then(function(data) {
			$rootScope.fields = data;

			for( var i = 0; i < $rootScope.fields.length; i = i + 2 )
				$scope.fieldsRange.push(i);

			generateCourseMeta();
		});
	} else {
		generateCourseMeta();
	}


	/**
	 * Listen for the courseAdded event. If it occurs add the course to
	 * the user's course array.
	 */
	$scope.$on( 'courseAdded', function(event, course) {
		generateCourseMeta( true );
	});


	/**
	 * Listen for the courseRemoved event.
	 */
	$scope.$on( 'courseRemoved', function(event, course) {
		generateCourseMeta( true );
	});

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
	$scope,
	$location,
	$log
) {
	var lastState = angular.copy($scope.user);

	$scope.updateStudent = function(user) {
		if ( angular.equals( lastState, $scope.user ) ) return;
		lastState = angular.copy( user );

		$scope.user.save();
	};

	$scope.deleteData = function() {
		$scope.user.delete();
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

	if (_.isEmpty($scope.user.mat_year))
		$scope.user.mat_year =  currentYear;

	if (_.isEmpty($scope.user.mat_term))
		$scope.user.mat_term =  'W';

	$scope.verify = function() {
		$scope.user.mat_verify = 1;

		if (_.isEmpty($scope.user.mat_term))
			$scope.user.mat_term =  'W';

		$scope.user.save();
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

	$scope.fields = $scope.user.getList('fields').$object;

	$scope.course = { field_id : parseInt($routeParams.field_id, 10), unofficial_year: $rootScope.meta.year, unofficial_term: $rootScope.meta.term };

	/**
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

		$rootScope.addCourse2(course);

		var added = $scope.$on( 'courseAdded', function(event, course) {
			$scope.submitted = false;
			$location.path('/~');

			added();
		});
	};

});
