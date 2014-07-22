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
		var username = $rootScope.user.getUsername();
		if (!_.isEmpty(username)) {
			$rootScope.title = current.title.replace(':username', username) +
				(current.title.length > 0 ? ' :: ' : '' ) +
				"Study Planning in Cognitive Science";
		}
	});


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

