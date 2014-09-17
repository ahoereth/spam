'use strict';

var spamControllersGuide = 'spam.controllers.guide';
angular.module(spamControllersGuide, []);



/**
 * CONTROLLER: Guide
 * ROUTE: /guide
 */
angular.module(spamControllersGuide).controller('GuideCtrl', function(
	$rootScope,
	$scope,
	$cacheFactory,
	$timeout,
	_,
	Restangular
) {

	$scope.guide = {};
	var tmp, guideCourses;

	var fetch = function() {
		Restangular.one( 'guide' ).getList( 1 ).then(function( guide ) {
			guideCourses = guide;
			tmp = _.groupBy( guide, 'semester' );
			_.each( tmp, function( v, k ) {
				$scope.guide[k] = _.groupBy( v, 'singleField' );
			});
		});
	};
	fetch(); // should depend on the dropdown select

	$scope.regulations = Restangular.all('regulations').getList();

	$scope.getTerm = function( semester ) {
		var t, date = new Date(), d = date.getFullYear() % 1000, m = date.getMonth();
		if ( semester%2 == 1 ) t = 'W';
		else                   t = 'S';

		if ( m > 8 && t == 'S' ) d++;
		return t + d;
	};


	/**
	 * Local implementation of addCourse in order to provide instant feedback
	 * to user.
	 *
	 * TODO: Merge with $scope.$parent.addCourse - in order to do this the
	 * should rely on the same course collection as the other course searches.
	 */
	$scope.addCourse = function( courseId, fieldId, e ) {
		if ( ! courseId || ! fieldId ) return;

		$scope.$parent.addCourse( courseId, fieldId );

		var target = _.findWhere( guideCourses, { course_id : courseId } );
		target.enrolled = true;

		var courseAddedListener = $scope.$on( 'courseAdded_'+courseId, function(event, course) {
			target.student_in_course_id = course.student_in_course_id;
			courseAddedListener();
		});
	};


	/**
	 * Local implementation of removeCourse in order to provide instant feedback
	 * to user.
	 *
	 * TODO: Merge with $scope.$parent.removeCourse - in order to do this the
	 * should rely on the same course collection as the other course searches.
	 */
	$scope.removeCourse = function (course) {
		// located in js/app.js
		$scope.$parent.removeCourse(course);

		// instant feedback to user
		var target = _.findWhere( guideCourses, { course_id : course.course_id } );
		target.enrolled = false;

		// wait for the courseRemoved event to redo the quick search
		var courseRemovedListener = $scope.$on( 'courseRemoved_'+course.course_id, function() {
			target.student_in_course_id = null;
			courseRemovedListener();
		});
	};

});
