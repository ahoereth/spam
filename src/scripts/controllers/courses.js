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
	TheUser,
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


	// get all regulations
	Restangular.all("regulations").getList().then(function( regulations ) {
		var t = _.findWhere( regulations, { regulation_id : 4 } );
		$scope.regulations = _.without( regulations, t );

		$scope.regulations.unshift( { regulation_id : '', regulation: "All courses" } );
		fetchParams();
	});


	/**
	 * TODO
	 */
	$scope.$watch('filter', function(next, current) {
		if ( _.isEmpty(next) ) return;

		applyFilter();
		refreshUrl();
	}, true);


	/**
	 * TODO
	 */
	$scope.$watch('pm', function(next, current) {
		if ( _.isUndefined(next) ) return;

		if ( next ) {
			$scope.filter['course_in_field_type#~'] = 'PM';
		} else {
			delete $scope.filter['course_in_field_type#~'];
			refreshUrl(); // delete does not trigger the filter watch
		}
	});


	/**
	 * TODO
	 */
	$scope.$watch('timeframe', function(next, current) {
		if ( _.isUndefined(next) ) return;

		if ( _.isEmpty(next) ) {
			delete $scope.filter['term'];
			delete $scope.filter['year'];
			refreshUrl(); // delete does not trigger the filter watch
		} else {
			if ( next[0].match(/[ws]/i) ) {
				$scope.filter.year = next.length > 2 ? '20' + next.slice(-2) : '';
				$scope.filter.term = next[0];
			} else {
				$scope.filter.year = '20' + next.slice(-2);
			}
		}
	});


	/**
	 * TODO
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
	 * TODO
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
			'course_in_field_type#~': params.pm ? 'PM' : null
		};

		if ( ! _.isUndefined( params.timeframe ) ) {
			if ( params.timeframe[0].match(/[ws]/i) ) {
				$scope.filter.year = params.timeframe.length > 2 ? '20' + params.timeframe.slice(-2) : '';
				$scope.filter.term = params.timeframe[0];
			} else {
				$scope.filter.year = '20' + params.timeframe.slice(-2);
			}
			$scope.timeframe = params.timeframe;
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
			pm : filter['course_in_field_type#~'] ? true : false
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
	 * TODO: unify with navbar.js
	 */
	var applyFilter = function(justFetch, force) {
		if ( ! justFetch )
			$scope.filteredCourses = $filter('courseFilter')(courses, $scope.filter);

		if ( lowerYear < 1995 || fetching ) return;

		if ( $scope.displayLimit > ( $scope.filteredCourses.length - 5 ) || force ) {
			fetching = true;
			Courses.fetch($scope.regulation_id, lowerYear, upperYear, TheUser.username).then(function(newCourses) {
				courses = newCourses;
				fetching = false;
				applyFilter();
			});
			lowerYear = lowerYear - 3;
		}
	};

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
		.get( { user : $rootScope.user ? $rootScope.user.username : null } )
		.then(function(course) {

		$scope.course = course;

		$scope.fields_in_regulations = {};
		_.each( course.fields, function( field ) {
			_.each( field.regulations, function( regulation ) {
				if ( _.isUndefined( $scope.fields_in_regulations[regulation.regulation] ) )
					$scope.fields_in_regulations[regulation.regulation] = [ field ];
				else
					$scope.fields_in_regulations[regulation.regulation].push( field );
			});
		});

		// refresh page title
		$scope.$emit('titleVariable', { variable : ':course', value : course.course });

	});

	// edit guide options modal
	$scope.guideModal = function() {
		var modal = $modal.open({
			templateUrl : "/~SPAM/app/partials/guide/modal.html",
			controller : [
				'$scope',
				'$modalInstance',
				'Restangular',

				function($scope, $modalInstance, Restangular) {

					var course = $scope.$parent.course;

					Restangular
						.all( 'guide' )
						.one( 'courses', course.course_id )
						.get()
						.then(function(guide) {

						$scope.guideInc = guide;
						watch();

					});

					var watch = function() {
						$scope.$watch( 'guideInc', function( obj, init ) {
							if ( obj == init ) return;

							$scope.guideInc.post();
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
			course = Restangular.one( 'courses', $routeParams.courseId ).get( { user : $rootScope.user ? $rootScope.user.username : null } ).then(function(course) {
			$scope.course = course;
			course.id = course.course_id;

			$scope.$emit('titleVariable', { variable : ':course', value : course.course + ' ' + course.year });

			course.fields = {};
			course.fields_pm = {};

			// init open regulation
			$scope.course.regulationExpanded = 0;

			$scope.course.teacher_ids = {};
			_.each( $scope.course.teachers, function( teacher ) {
				this[ teacher.teacher_id ] = true;
			}, $scope.course.teacher_ids );

			course.getList('fields').then(function( fields ) {
				_.forEach( fields, function( field ) {
					this[field.field_id] = true;
					if ( field.course_in_field_type == 'PM' )
						$scope.course.fields_pm[field.field_id] = true;
				}, $scope.course.fields );
			});
		});
	} else {
		course = Restangular.all('courses');
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
