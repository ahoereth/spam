angular.module('spam', [
	'ngRoute',
	'ngSanitize',
//	'ngAnimate',

	'restangular',
	'ui.bootstrap',

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

	var auth = { authentication : [
		'$route',
		'Auth',
		function(
			$route,
			Auth
		) {
			return Auth.authenticate($route.current.access);
		}
	]};

	$routeProvider.when('/', {
		templateUrl: base + '/landing.html',
		title: '',
		access: 0,
		resolve : auth
	});

	$routeProvider.when('/login', {
		templateUrl: base + '/login.html',
		controller: 'Login',
		title: 'Login',
		access: 0,
		resolve : auth
	});

	$routeProvider.when('/help', {
		templateUrl: base + '/help.html',
		controller: 'Help',
		title: 'Help',
		access: 0,
		resolve : auth
	});

	$routeProvider.when('/401', {
		templateUrl: base + '/401.html',
		title: 'Page not found',
		access: 0,
		resolve : auth
	});

	$routeProvider.when('/guide', {
		templateUrl: base + '/guide/index.html',
		controller: 'GuideCtrl',
		title: 'Guide',
		access: 0,
		resolve : auth
	});

	// home
	$routeProvider.when('/~', {
		templateUrl: base + '/home/index.html',
		controller: 'Home',
		title: ':username',
		reloadOnSearch: false,
		access: 1,
		resolve : auth
	});

	// home - settings
	$routeProvider.when('/~/settings', {
		templateUrl: base + '/home/settings.html',
		controller: 'UserSettings',
		title: ':username\'s settings',
		access: 1,
		resolve : auth
	});

	// home - logout
	$routeProvider.when('/~/logout', {
		templateUrl: base + '/landing.html',
		controller: 'Logout',
		title : 'Logout',
		access: 1,
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
		title: 'Courses',
		reloadOnSearch: false,
		access: 0,
		resolve : auth,
	});

	// courses - create new
	$routeProvider.when('/courses/new', {
		templateUrl: base + '/courses/edit.html',
		controller: 'Course_edit',
		title: 'New Course',
		access: 32,
		resolve : auth
	});

	// courses - view proposals
	$routeProvider.when('/courses/proposals', {
		templateUrl: base + '/courses/proposals.html',
		controller: 'Course_proposals',
		title: 'Edit proposals',
		access: 32,
		resolve : auth
	});

	// courses - view single
	$routeProvider.when('/courses/:courseId', {
		templateUrl: base + '/courses/show.html',
		controller: 'CourseCtrl',
		title: ':course',
		access: 0,
		resolve : auth
	});

	// courses - edit
	$routeProvider.when('/courses/:courseId/edit', {
		templateUrl: base + '/courses/edit.html',
		controller: 'Course_edit',
		title: 'Edit :course',
		access: 4,
		resolve : auth
	});

	// admin index
	$routeProvider.when('/admin', {
		templateUrl: base + '/admin/index.html',
		title: 'Administration',
		access: 32,
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
	 * Handle errors occurring on route changing. This is called when one of the
	 * promises to be resolved before visiting the route is rejected.
	 */
	$rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
		if ('not_authenticated' == rejection) {
			$rootScope.requested_route = $location.path();
			$location.path( '/401' );
		} else {
			$location.path( '/login' );
		}
	});


	/**
	 * Called on every route change for user authentication verification and
	 * possible redirecting.
	 */
	$rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
		if (_.isUndefined(current)) return;

		// don't allow entering the page on /401
		if (current.originalPath == "/401" && _.isUndefined(previous)) {
				$location.path('/');
				return;
		}

		// handle the page title
		var username = TheUser.getUsername();
		if (!_.isEmpty(username)) {
			$rootScope.title = current.title.replace(':username', username) +
				(current.title.length > 0 ? ' :: ' : '' ) +
				"Study Planning in Cognitive Science";
		}
	});


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
		t.loading = true;

		Auth.init(
			t.username,
			t.password,
			t.remember
		).then( function() {
			t.loading = false;
			DataHandler.removeUserDependent();

			if (TheUser.loggedIn()) {
				$rootScope.loginform = {};

				var targetRoute = _.isEmpty($rootScope.requested_route) ? '/~' : $rootScope.requested_route;
				$location.path(targetRoute);
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

