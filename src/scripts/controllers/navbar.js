/**
 * TODO
 */
angular.module('spam.controllers.navbar', []).controller('Navbar', function(
	$rootScope,
	$scope,
	$location,
	$filter,
	$timeout,
	_,
	Courses
) {

	var courses = [],
	hideLoader,
	lowerYear = $rootScope.meta.year-1,
	upperYear = $rootScope.meta.year+1,
	fetching = false,
	filteredIds = [],
	filteredSelectedKey = 0;

	$scope = _.extend( $scope, {
		search : {
			query : '',
			filtered : [],
			limit : 4,
			filter : {},
			selected : null,
			placeholder : 'Quick search'
		},
		navExpanded : false
	});


	/**
	 * Close dropdown navigation on mobile devices when changing route.
	 */
	$rootScope.$on("$routeChangeSuccess", function () {
		$scope.navExpanded = false;
	});


	/**
	 * Watch the loading variable to show or hide the loading animation.
	 */
	$rootScope.$watch( 'loading', function( n, o ) {
		if ( n > 0 ) {
			$timeout.cancel( hideLoader );
			$scope.showLoader = true;
		} else if ( n < 0 ) {
			$rootScope.loading = 0;
		} else {
			hideLoader = $timeout( function() {
				$scope.showLoader = false;
			}, 1100 );
		}
	});


	/**
	 * Watch the quick search input field for changes.
	 */
	$scope.$watch('search.query', function( query, oldQuery ) {
		// don't do anything if noting actually changed
		if ( query === oldQuery ) return;

		var match = query.match( /^([ws])?(\d{2,4})?:?(.*)$/i);
		if ( match ) {
			$scope.search.filter = {
				'term'   : _.isEmpty( match[1] ) ? '' : match[1].toUpperCase(),
				'year'   : _.isEmpty( match[2] ) ? '' : ("20" + match[2]).slice( -4 ),
				'course' : _.trim(match[3])
			};
			_.compactObject( $scope.search.filter );
		} else { // this is just a backup if the regex above fails
			$scope.search.filter = {
				course : query
			};
		}

		applyFilter();
	});


	/**
	 * TODO
	 */
	var applyFilter = function(justFetch) {
		if ( $scope.search.query.length === 0 ) {
			$scope.search.filtered = [];
			return;
		}

		$scope.search.filtered = $filter('courseFilter')(courses, $scope.search.filter).splice(0,$scope.search.limit);

		resetKeyboardNavigation();
		fetch();
	};


	/**
	 * TODO
	 */
	var fetch = function() {
		if ( lowerYear < 1995 || fetching ) return;

		if ( $scope.search.limit > $scope.search.filtered.length ) {
			fetching = true;
			Courses.fetch($scope.user.getRegulation(1), lowerYear, upperYear, null).then(function(newCourses) {
				courses = newCourses;
				fetching = false;
				applyFilter();
			});
			lowerYear = lowerYear - 2;
		}
	};


	/**
	 * Watch the focus property of the input field.
	 */
	$scope.$watch('search.focus', function( focused ) {
		if ( focused === false ) searchBoxToggle( 'blur'  );
		else if ( focused ) {

			filteredSelectedKey = 0;
			$scope.search.selected = filteredIds[filteredSelectedKey];

			if ( ! $scope.search.active )
				applyFilter();

			searchBoxToggle( 'focus' );
		}
	}, true );


	/**
	 * Watch the hover property of the navbar/quick search results.
	 * The timeout is required because moving the mouse inline the "area-to-be-hovered"
	 * also often triggers this event.
	 */
	$scope.$watch('search.hover', function( hovering ) {
		$timeout.cancel( mouseTimeout );
		mouseTimeout = $timeout( function() {
			if ( hovering === false ) searchBoxToggle( 'mouseout'  );
			else if ( hovering )      searchBoxToggle( 'mouseover' );
		}, 200 );
	}, true );
	var mouseTimeout;


	/**
	 * Change the quick search result box visibility.
	 * The box will stay visible while mouseover or while input field is focused,
	 * but it will only start to be visible on focus.
	 *
	 * The box will not hide directly but with a offset of 300ms
	 * (eventually plus the hover offset defined above).
	 *
	 * @param string happening 'mouseover'/'mouseout'/'focus'/'blur'
	 */
	var searchBoxToggle = function( happening ) {
		$timeout.cancel( states.timer );

		// save information about the current state
		switch ( happening ) {
			case 'mouseover': states.mouse = true;  break;
			case 'mouseout' : states.mouse = false; break;
			case 'focus'    : states.input = true;  break;
			case 'blur'     : states.input = false; break;
		}

		// if input is focused always show the results
		if ( states.input ) {
			$scope.search.active = true;
			$scope.search.placeholder = '11: Try prepending a year or term';

		// if input is not focused and mouse is not hovering the
		} else if ( ! states.input && ! states.mouse ) {

			// dont hide it directly
			states.timer = $timeout( function() {
				if ( ! _.isUndefined( $scope.search ) ) {
					$scope.search.active = false;
					$scope.search.placeholder = 'Quick search';
				}
			}, 300 );
		}
	};
	var states = { mouse : false, input : false, timer : null };


	/**
	 * Triggered when a user adds a course from the quick search results;
	 * either by using the button or pressing enter.
	 *
	 * @param int courseId course_id to add
	 * @paraim int fieldId field_id to add the course to
	 */
	$scope.addCourse = function( courseId, fieldId ) {
		// Note: fieldId can be 'null' (string)!!
		if ( courseId === null || fieldId === null ) return;

		filteredIds = _.without(filteredIds, courseId);
		filteredSelectedKey = filteredSelectedKey % filteredIds.length; // no +1 because we removed a key from the array
		$scope.search.selected = filteredIds[filteredSelectedKey];

		// located in js/app.js
		$scope.$parent.addCourse( courseId, fieldId );
	};


	/**
	 * Removes the user from a course when he clicks the remove button in the list
	 * of quick search results.
	 *
	 * @param course course
	 */
	$scope.removeCourse = function(course) {
		// wait for the courseRemoved event to reset the keyboard navigation handles
		var courseRemovedListener = $scope.$on( 'courseRemoved_'+course.course_id, function() {
			resetKeyboardNavigation();
			courseRemovedListener();
		});

		// located in js/app.js
		$scope.$parent.removeCourse(course);
	};


	/**
	 * Resets the keyboard navigation handles. Generates a list of courseIds to
	 * navigate through (not enrolled courses) and resets all handles to the first one.
	 */
	var resetKeyboardNavigation = function() {
		filteredIds = [];
		filteredSelectedKey = 0;

		if ( $scope.user.username ) { // logged in?
			_.each($scope.search.filtered, function( course, idx ) {
				if ( ! course.enrolled )
					filteredIds.push( course.course_id );
			});
		}

		$scope.search.selected = filteredIds.length > 0 ? filteredIds[filteredSelectedKey] : 0;
	};


	/**
	 * Keyboard navigation for the quick search input. Called when the quick search
	 * input is focused and the user presses a key. Only reacts to the up and down
	 * arrows as well as enter and esc.
	 *
	 * @param angularEvent $event contains information about the keypress
	 */
	$scope.keyboardNavigation = function( $event ) {
		if ( ! _.contains( [40, 38, 13, 27], $event.keyCode ) || ! $scope.user.loggedin ) // down, up, enter, esc, not logged in?
			return;

		$event.preventDefault();

		// get the currently selected course
		var t  = _.findWhere( this.search.filtered, { course_id : this.search.selected } );
		if ( _.isUndefined( t ) ) return;

		// react differently for different key presses
		switch ( $event.keyCode ) {
			case 40: courseListMove( t, 'down'); break; // arrow down
			case 38: courseListMove( t, 'up'  ); break; // arrow up
			case 13: courseSubmit(t);            break; // enter key
			case 27: $scope.leaveSearch(t);      break; // esc key
		}
	};


	/**
	 * Triggered when the user presses arrow up or arrow down on a selected course in the result list of the quick search.
	 * This either moves the course selection or the field dropdown selection up/down.
	 *
	 * @param angular.element e button group which contains all available fields (if multiple)
	 * @param course t currently selected course
	 * @param string d 'up'/'down': movement direction
	 */
	var courseListMove = function( t, d ) {
		// don't do anything if there are no courses to move through
		if( ! filteredIds.length ) return;

		// navigate search result list when the dropdown is not open
		if ( ! t.open ) {
			filteredSelectedKey = ( d == 'up' ? filteredSelectedKey + filteredIds.length - 1 : filteredSelectedKey + 1 ) % filteredIds.length;
			$scope.search.selected = filteredIds[filteredSelectedKey];

		// navigate a dropdown menu if it is open
		} else {
			t.li = (t.li + 1) % t.fields.length;
		}
	};


	/**
	 * Triggered when user presses enter on a selected course in the result list of the quick search.
	 * This either adds the course (if only 1 field) or opens the dropdown menu if the course has multiple fields.
	 *
	 * TODO: Maybe strip dropdown? Users can move the course later on actually... Would remove quite some headaches in this code.
	 *
	 * @param angular.element e button group which contains all available fields (if multiple)
	 * @param course t currently selected courseD
	 */
	var courseSubmit = function( t ) {
		// if course has only one field add it directly
		if ( t.singleField ) {
			$scope.addCourse( t.course_id, t.singleField );

		// if dropdown menu is closed, open it
		} else if ( ! t.open ) {
			t.open = true;
			t.li = 0;

		// otherwise add the course to the field which is selected in the dropdown menu
		} else {
			$scope.addCourse( t.course_id, t.fields[ t.li ].field_id );
			$scope.leaveSearch( t );
		}
	};


	/**
	 * Closes the search or the currently opened add course to one of multiple fields dropdown.
	 * This function is called when the quick search input is focused and the user presses the 'esc' key
	 * on his keyboard.
	 *
	 * @param angular.element e button group which contains all available fields (if multiple)
	 */
	$scope.leaveSearch = function( t ) {
		// leave search
		if ( _.isUndefined(t) || ! t.open ) {
			$scope.search.active = false;
			if ( states.input ) {
				$scope.search.results = [];
				$scope.search.quick = '';
			}

		// exit dropdown menu
		} else {
			t.open = false;
		}
	};


	/**
	 * Checks if the given path is a substring of the beginning of the current route and
	 * returns the css class 'active' for highlighting.
	 *
	 * TODO: Why is this rootscope?
	 *
	 * @param string path the string to look for in the route
	 * @return string 'active':''
	 */
	$rootScope.getNavigationActiveClass = function(path) {
		return ( $location.path().substr(0, path.length) == path ) ? 'active' : '';
	};

});
