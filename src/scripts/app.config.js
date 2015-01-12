(function() {
  'use strict';

  angular
    .module('spam')
    .config(configuration);


  /* @ngInject */
  function configuration(
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

    $routeProvider.when('/help/:subject*?', {
      templateUrl: base + '/help.html',
      controller: 'Help',
      title: 'Help',
      access: 0,
      resolve : auth
    });

    $routeProvider.when('/help', {
      redirectTo: '/help/remember'
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
      title: ':course :: Edit',
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

    // intercept http requests for general error handling and loading animation
    $httpProvider.interceptors.push('httpIntercept');

    // set restangular api base url
    RestangularProvider.setBaseUrl('/~SPAM/api');
  }

})();
