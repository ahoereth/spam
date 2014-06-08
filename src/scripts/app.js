angular.module('spam', [
	'ngRoute',
	'ngSanitize',
//	'ngResource',
//	'ngAnimate',

	'restangular',
	'ui.bootstrap',
	'pasvaz.bindonce',

	'spam.filters',

	'services',
	'services.courses',
	'services.dataHandler',
	'services.httpIntercept',

	'spam.directives',
	'souffleur',
	'infiniteScroll',

	'spam.controllers.main',
	'spam.controllers.admin',
	'spam.controllers.courses',
	'spam.controllers.guide',
	'spam.controllers.http',
	'spam.controllers.home',
	'spam.controllers.navbar'
]).


config( function(
	$routeProvider,
	$locationProvider,
	$httpProvider,
	RestangularProvider
) {

	$locationProvider.html5Mode(true).hashPrefix('!');

	var base = 'partials';

	var auth = { auth : [ 'Auth', '$q', function( Auth, $q ) { return $q.all( Auth.promise() ); } ] };

	$routeProvider.when('/', {
		templateUrl: base + '/landing.html',
		access: 0,
		title: '',
		resolve : auth
	});

	$routeProvider.when('/login', {
		templateUrl: base + '/login.html',
		access: 0,
		controller: 'Login',
		title: 'Login',
		resolve : auth
	});

	$routeProvider.when('/help', { templateUrl: base + '/help.html',
		access: 0,
		controller: 'Help',
		title: 'Help',
		resolve : auth
	});

	$routeProvider.when('/401', {
		templateUrl: base + '/401.html',
		access: 0,
		title: 'Page not found',
		resolve : auth
	});

	$routeProvider.when('/guide', {
		templateUrl: base + '/guide/index.html',
		access: 0,
		controller: 'GuideCtrl',
		title: 'Guide',
		resolve : auth
	});

	// home
	$routeProvider.when('/~', {
		templateUrl: base + '/home/index.html',
		controller: 'Home',
		access: 1,
		title: ':username',
		resolve : auth,
		reloadOnSearch: false
	});

	// home - settings
	$routeProvider.when('/~/settings', {
		templateUrl: base + '/home/settings.html',
		controller: 'UserSettings',
		access: 1,
		title: ':username\'s settings',
		resolve : auth
	});

	// home - logout
	$routeProvider.when('/~/logout', {
		templateUrl: base + '/landing.html',
		controller: 'Logout',
		access: 1,
		title : 'Logout',
		resolve : auth
	});

	// home - unofficial courses - new
	$routeProvider.when('/~/courses/new', {
		templateUrl: base + '/courses/unofficial/edit.html',
		controller: 'Unofficial_edit',
		access: 1,
		title: 'Add unofficial Course',
		resolve : auth
	});

	// courses index
	$routeProvider.when('/courses', {
		templateUrl: base + '/courses/index.html',
		controller: 'Courses',
		access: 0,
		title: 'Courses',
		resolve : auth,
		reloadOnSearch: false
	});

	// courses - create new
	$routeProvider.when('/courses/new', {
		templateUrl: base + '/courses/edit.html',
		controller: 'Course_edit',
		access: 32,
		title: 'New Course',
		resolve : auth
	});

	// courses - view proposals
	$routeProvider.when('/courses/proposals', {
		templateUrl: base + '/courses/proposals.html',
		controller: 'Course_proposals',
		access: 32,
		title: 'Edit proposals',
		resolve : auth
	});

	// courses - view single
	$routeProvider.when('/courses/:courseId', {
		templateUrl: base + '/courses/show.html',
		controller: 'CourseCtrl',
		access: 0,
		title: ':course',
		resolve : auth
	});

	// courses - edit
	$routeProvider.when('/courses/:courseId/edit', {
		templateUrl: base + '/courses/edit.html',
		controller: 'Course_edit',
		access: 4,
		title: 'Edit :course',
		resolve : auth
	});

	// admin index
	$routeProvider.when('/admin', {
		templateUrl: base + '/admin/index.html',
		access: 32,
		title: 'Administration',
		resolve : auth
	});

	// required for using relative root ("/") links
	$routeProvider.when('/.', { redirectTo: '/' } );

	// redirect everything else to the root
	$routeProvider.otherwise( { redirectTo: '/' } );


	// intercept all http requests for general error handling and loading visualization
	$httpProvider.interceptors.push('httpIntercept');

	// set restangular api base url
	RestangularProvider.setBaseUrl('/~SPAM/api');

})

.run(function(Restangular) {

	Restangular.configuration.getIdFromElem = function(elem) {
		if (elem.id)
			return elem.id;

		if ( elem.route == 'users' ) {
			return elem['username'];
		} else {
			var e = elem[_.initial(elem.route).join('') + "_id"];
			return e;
		}
	};

})

.run( function(
	$rootScope,
	$location,
	$route,
	$q,
	$http,
	$timeout,
	$window,
	$log,
	$modal,
	Auth,
	_,
	Courses,
	TheUser,
	DataHandler
){
	var d = new Date(), m = d.getMonth(), y = d.getFullYear();
	$rootScope.meta = {
		'year'            : d.getFullYear(),
		'month'           : m,
		'term'            : ( m > 8 || m < 3 ) ? 'W' : 'S',
		'otherTerm'       : ( m > 8 || m < 3 ) ? 'S' : 'W',
		'currentTermYear' : ( m > 3 ) ? y : y - 1,
		'lastTermYear'    : ( m > 8 ) ? y : y - 1,
		'nextTermYear'    : ( m < 3 ) ? y : y + 1,
		'webstorage'      : _.isUndefined( Storage ) ? false : true
	};

	$rootScope.title = "Study Planning in Cognitive Science";


	/**
	 * Called on every route change for user authentication verification and
	 * possible redirecting.
	 */
	$rootScope.$on("$routeChangeSuccess", function( event, next, current ) {
		if ( _.isUndefined( next ) ) return;

		// don't allow entering the page on /401
		if ( next.originalPath == "/401" && _.isUndefined( current ) ) {
				$location.path('/');
				return;
		}

		// access: public | user | editor
		if ( next.access != 0 ) {

			//  0 : visitor
			//  1 : logged in
			//  2 : ldap logged in
			//  4 : approved
			//  8 :
			// 16 : teacher
			// 32 : editor
			// 64 : administrator
			if ( $rootScope.user ) {
				$rootScope.title = next.title.replace(':username', $rootScope.user.username || 'you') + ( next.title.length > 0 ? ' :: ' : '' ) + "Study Planning in Cognitive Science";

				if ( next.access > $rootScope.user.rank ) {
					$rootScope.requested_route = next.originalPath;
					$location.path( '/401' );
				}

				// editors, teachers and admins do not get access to /~ routes
				if ( next.access > 0 && next.access < 4 && $rootScope.user.rank >= 16 ) {
					$rootScope.requested_route = next.originalPath;
					$location.path( '/401' );
				}
			} else {
				$rootScope.requested_route = next.originalPath;
				$location.path( '/401' );
			}
		}
	});
	$rootScope.courseTerms = [];


	/**
	 * Adds a course to the curent user's planner.
	 *
	 * @param {int} courseId course_id database field
	 * @param {int} fieldId  field_id database field
	 */
	$rootScope.addCourse = function( courseId, fieldId ) {
		if ( courseId === null || fieldId === null ) return;

		$rootScope.addCourse2( { course_id : courseId, field_id : fieldId } );
	};


	/**
	 * Replaces $rootScope.addCourse
	 */
	$rootScope.addCourse2 = function(studentInCourse) {
		var target = Courses.get(TheUser.getRegulation(), studentInCourse.course_id);
		if ( target )
			target.enrolled = true;

		TheUser.all('courses').post( studentInCourse ).then(function( course ) {
			DataHandler.resetGuide();

			//Courses.enroll(TheUser.getRegulation(), course.course_id, course.student_in_course_id);
			if ( target )
				target.student_in_course_id = course.student_in_course_id;

			if ( $rootScope.studentCourses )
				$rootScope.studentCourses.push( course );

			if ( studentInCourse.course_id )
				$rootScope.$broadcast('courseAdded_' + studentInCourse.course_id, course);

			$rootScope.$broadcast('courseAdded', course);
			$log.info( 'Added: ' + course.course );
		});
	};


	/**
	 * Removes a course from the current user's planner.
	 *
	 * @param {int}    courseId course_id database field
	 * @param {object} course   object used for broadcasting
	 */
	$rootScope.removeCourse = function (course) {
		var target2 = _.findWhere( $rootScope.studentCourses, { student_in_course_id : course.student_in_course_id } );
		$rootScope.studentCourses = _.without( $rootScope.studentCourses, target2 );

		var target = Courses.get(TheUser.getRegulation(), course.course_id);
		if ( target )
			target.enrolled = false;

		TheUser.one('courses', course.student_in_course_id).remove().then(function() {
			DataHandler.resetGuide();

			//Courses.unroll(TheUser.getRegulation(), course.course_id);
			if ( target )
				target.student_in_course_id = null;

			$log.info( 'Removed: ' + course.course );
			$rootScope.$broadcast( 'courseRemoved', course );
			$rootScope.$broadcast( 'courseRemoved_'+course.course_id, course );
		});
	};


	/**
	 * User login
	 */
	$rootScope.login = function() {
		var t = this.loginform;
		var username = t.username;
		t.loading = true;
		$q.all( Auth.setCrededentials( this.loginform.username, this.loginform.password, this.loginform.remember ) ).then( function() {
			t.loading = false;
			DataHandler.removeUserDependent();

			if ( $rootScope.user ) {
				$rootScope.loginform = {};
				$location.path('/~');
			} else {
				$rootScope.loginform.password = '';
				$location.path('/login').search( { error : true } );
			}
		});
	};
	$rootScope.loginform = { username : '' };


	var whichbrowser = function () {
		$timeout( function() {
			if ( ( typeof $window.WhichBrowser === 'undefined' ) ) {
				whichbrowser();
			} else {
				var b = new $window.WhichBrowser();

				$http.get('/~SPAM/api/loginfo', { params : {
					browser : { name : b.browser.name, version : b.browser.version.major },
					os      : { name : b.os.name, version : _.isNull( b.os.version ) ? null : b.os.version.original },
					device  : b.device.type,
					screen  : { width: $window.screen.width, height: $window.screen.height }
				}}).success( function( data ) {
					$rootScope.souffleur = data;
				});
			}
		}, 5000);
	};
	whichbrowser();

});

