var spamControllersCourses = 'spam.controllers.courses';
angular.module(spamControllersCourses, []);



/**
 * CONTROLLER: Courses
 * ROUTE: /courses
 */
angular.module(spamControllersCourses).controller('Courses', function(
	$rootScope,
	$scope,
	$location,
	$routeParams,
	$filter,
	$q,
	Restangular,
	_,
	Courses
) {

	var currentOffset = 0,
	url = {},
	all = false,
	lowerYear = $rootScope.meta.year-1,
	upperYear = $rootScope.meta.year+1,
	courses = [],
	fetching = false,
	originalDisplayLimit = 25;

	_.extend( $scope, {
		coursesPerFetch : 100,
		courseSelected : 0,
		fetchNoMore : false,
		displayLimit : 25,
		filter : {},
		filteredCourses : [],
		orderBys: {
			code:        ['code','-year','-term', 'course'],
			'-code':     ['-code','-year','-term', 'course'],
			course:      ['course','-year','-term'],
			'-course':   ['-course','-year','-term'],
			teachers:    ['teachers_str','-year','-term', 'course'],
			'-teachers': ['-teachers_str','-year','-term', 'course'],
			fields:      ['fields_str','-year','-term', 'course'],
			'-fields':   ['-fields_str','-year','-term', 'course'],
			time:        ['year','-term', 'course'],
			'-time':     ['-year', '-term', 'course']
		},
	});
	$scope.order = $scope.orderBys['-time'];


	/**
	 * watches the general filter object. Contains the code, title, teachers and
	 * field of study input fields.
	 */
	$scope.$watch('filter', function(next, current) {
		if (next == current) return;

		applyFilter();
		refreshUrl();
	}, true);


	/**
	 * Watches the "obligatory module" checkbox.
	 */
	$scope.$watch('pm', function(next, current) {
		if ( _.isUndefined(next) ) return;

		if ( next ) {
			$scope.filter['fields_str#~'] = '(PM)';
		} else {
			delete $scope.filter['fields_str#~'];
			refreshUrl(); // delete does not trigger the filter watch
		}
	});


	/**
	 * Watches the timeframe input field.
	 */
	$scope.$watch('timeframe', function(next, current) {
		if ( _.isUndefined(next) ) return;

		refreshUrl(); // delete does not trigger the filter watch
	});


	/**
	 * Is triggered when the user changes the regulation input field.
	 */
	$scope.$watch('regulation_id', function(next, current) {
		if ( _.isUndefined(next) ) return;

		$scope.displayLimit = originalDisplayLimit;
		lowerYear = $rootScope.meta.year-1;

		$scope.filteredCourses = [];
		applyFilter(true);
		refreshUrl();
	});


	/**
	 * Called when user explicitly clicks the "show more courses" button. This
	 * won't be used in most cases because of infinite scrolling.
	 */
	$scope.scrollOn = function(amount) {
		if ( $scope.displayLimit < $scope.filteredCourses.length )
			$scope.displayLimit += _.isUndefined(amount) ? originalDisplayLimit : amount;

		if ( $scope.displayLimit > ($scope.filteredCourses.length - 50) )
			applyFilter(true);
	};


	$scope.orderBy = function(order) {
		$scope.order = $scope.order === $scope.orderBys[order] ? $scope.orderBys['-' + order] : $scope.orderBys[order];
		lowerYear = lowerYear <= 1995 ? lowerYear - 1 : 1995;
		applyFilter(true,true);
	};


	/**
	 * Extract the url parameters for use in a search query.
	 */
	var fetchParams = function () {
		var params = $routeParams;

		$scope.filter = {
			code: params.code,
			course: params.course,
			teachers_str: params.teacher,
			fields_str: params.field,
			'fields_str#~': params.pm ? '(PM)' : null
		};

		if ( ! _.isUndefined( params.timeframe ) ) {
			$scope.timeframe = params.timeframe;

			params.timeframe = params.timeframe.toLowerCase();
			if ( params.timeframe.charAt(0) === 'w' || params.timeframe.charAt(0) === 's' ) {
				$scope.filter['term#='] = params.timeframe.charAt(0);
				params.timeframe = params.timeframe.slice(1);
			}

			var pattern = /(?:^(?:20)?(\d{2})$)|(?:(?:20)?(\d{2})([+-])(?:(?:20)?(\d{2}))?)|(?:([WS])S?(?:20)?(\d{2}))|([WS])/i;
			var r = _.compact(pattern.exec(_.trim(params.timeframe)));

			if ( ! _.isEmpty(r) ) {
				if ( _.isEmpty(r[2]) ) {
					$scope.filter['year#='] = '20' + r[1];
				} else if ( r[2] === '+' ) {
					// year lower limit
					$scope.filter['year#<'] = '20' + r[1];

				} else if ( r[2] === '-' ) {
					if ( ! _.isEmpty(r[3]) ) {
						// years range
						$scope.filter['year#<'] = '20' + r[1];
						$scope.filter['year#>'] = '20' + r[3];

					} else {
						// year upper limit
						$scope.filter['year#>'] = '20' + r[1];

					}
				}
			}
		}

		$scope.filter = _.compactObject($scope.filter);

		$scope.regulation_id = params.regulation ? parseInt(params.regulation, 10) : '';
	};


	/**
	 * Updates all URL parameters using the information from the current filters.
	 */
	var refreshUrl = function() {
		var filter = $scope.filter;
		url = {
			regulation : $scope.regulation_id,
			timeframe : $scope.timeframe,
			code : filter.code,
			course : filter.course,
			teacher : filter.teachers_str,
			field : filter.fields_str,
			pm : filter['fields_str#~'] ? true : false
		};
		url = _.compactObject( url );

		$location.search( url );
	};


	/**
	 * Watch for route updates and refetch the course list if required
	 */
	$scope.$on('$routeUpdate', function(event, route) {
		if (route.params == url) return;

		fetchParams();
	});


	/**
	 * Refreshes des course list with the new filters applied.
	 *
	 * TODO: unify with navbar.js
	 */
	var applyFilter = function(justFetch, force) {
		if ( ! justFetch )
			$scope.filteredCourses = $filter('courseFilter')(courses, $scope.filter);

		if ( lowerYear < 1995 || fetching ) return;

		if ( $scope.displayLimit > ( $scope.filteredCourses.length - 5 ) || force ) {
			fetching = true;

			Courses.fetch($scope.regulation_id, lowerYear, upperYear, null).then(function(newCourses) {
				courses = newCourses;
				fetching = false;
				applyFilter();
			});
			lowerYear = lowerYear - 3;
		}
	};


	// get all regulations
	Restangular.all("regulations").getList().then(function( regulations ) {
		var t = _.findWhere( regulations, { regulation_id : 4 } );
		$scope.regulations = _.without( regulations, t );

		$scope.regulations.unshift( { regulation_id : '', regulation: "All courses" } );
		fetchParams();
	});
});



/**
 * CONTROLLER: Course
 * ROUTE: /courses/:course_id
 */
angular.module(spamControllersCourses).controller('CourseCtrl', function(
	$scope,
	$rootScope,
	$routeParams,
	$modal,
	_,
	Restangular
){

	Restangular
		.one('courses', $routeParams.courseId )
		.get( { user : $scope.user.getUsername() } )
		.then(function(course) {

		$scope.course = course;

		course.fields_by_regulations = {};

		_.forEach(course.fields, function(field) {
			_.forEach(field.regulations, function(regulation) {
				if (_.isUndefined(course.fields_by_regulations[regulation.regulation])) {
					course.fields_by_regulations[regulation.regulation] = [];
				}

				// generate links
				var fieldclone = angular.copy(field);
				fieldclone.search =
					"courses?regulation=" + regulation.regulation_id +
					"&field=" + fieldclone.field;
				fieldclone.searchpm = fieldclone.search + "&pm";

				course.fields_by_regulations[regulation.regulation].push(fieldclone);
			});
		});

		// refresh page title
		$scope.$emit('title', { ':course': course.course + ' ' + course.year });

	});

	// edit guide options modal
	$scope.guideModal = function() {
		var modal = $modal.open({
			templateUrl : "partials/guide/modal.html",
			controller : [
				'$scope',
				'$modalInstance',
				'Restangular',

				function($scope, $modalInstance, Restangular) {

					var course = $scope.$parent.course;

					Restangular
						.all( 'guides' )
						.one( 'courses', course.course_id )
						.get()
						.then(function(guide) {

						guide.course_id = course.course_id;
						$scope.guideInc = guide;
						watch();

					});

					var watch = function() {
						$scope.$watch( 'guideInc', function( obj, init ) {
							if ( obj == init ) return;

							$scope.guideInc.put();
						}, true );
					};

					$scope.close = function () {
						$modalInstance.close();
						watch();
					};
				}
			],
			scope: $scope
		});
	};

});



/**
 * CONTROLLER: Course_edit
 * ROUTE: /courses/:course_id/edit
 */
angular.module(spamControllersCourses).controller('Course_edit', function(
	$rootScope,
	$scope,
	$routeParams,
	$location,
	_,
	Restangular
){

	var course;
	$scope.pageType = ( $location.path().substr( $location.path().length - ('/new').length ) == '/new' ) ? 'new' : 'edit';

	// course and fields
	if ( $scope.pageType == 'edit' ) {
		$scope.course = {};
		course = Restangular.one( 'courses', $routeParams.courseId ).get( { user : $scope.user.getUsername() } ).then(function(course) {
			course.id = course.course_id;

			$scope.$emit('title', { ':course': course.course + ' ' + course.year });

			// init open regulation
			course.regulationExpanded = 0;

			course.teacher_ids = {};
			_.each( course.teachers, function( teacher ) {
				this[ teacher.teacher_id ] = true;
			}, course.teacher_ids );

			// handle fields
			var fields = course.fields;
			course.fields = {};
			course.fields_pm = {};

			_.forEach( fields, function( field ) {
				this[field.field_id] = true;
				if ( field.course_in_field_type == 'PM' )
					course.fields_pm[field.field_id] = true;
			}, course.fields );

			$scope.course = angular.extend($scope.course, course);
		});
	} else {
		$scope.course = {
			term : $rootScope.meta.term,
			year : $rootScope.meta.year,
			language : 'DE',
			teachers : [],
			fields : {},
			fields_pm : {},
			teacher_ids : [],
			regulationExpanded : 0
		};
	}

	// query fields
	Restangular.all( 'fields' ).getList().then(function( fields ) {
		$scope.fields_in_regulations = _.groupBy( fields, 'regulation' );
	});

	// query teachers
	$scope.teachers = Restangular.all( 'teachers' ).getList().$object;

	$scope.course.teacher_input = '';
	$scope.$watch( 'course.teacher_input', function( teacher ) {
		if ( teacher && teacher.teacher_id ) {
			var found = false;
			_.each( $scope.course.teacher_ids, function(v, teacher_id) {
				if ( teacher_id == teacher.teacher_id ) {
					this[teacher_id] = true;
					found = true;
				}
			}, $scope.course.teacher_ids);

			if ( ! found ) {
				$scope.course.teachers.push( {
					teacher_id : teacher.teacher_id,
					teacher : teacher.teacher
				});
				$scope.course.teacher_ids[ teacher.teacher_id ] = true;
			}
			$scope.course.teacher_input = '';
		}
	});

	$scope.updateCourse = function() {
		if ( $scope.pageType == 'edit' ) {

			$scope.course.put().then(function( course ) {
				$location.path('/courses/'+course.course_id);
			});

		} else if ( $scope.pageType == 'new' ) {

			course.post( $scope.course ).then(function( course ) {
				$location.path('/courses/'+course.course_id);
			});

		}
	};

});
