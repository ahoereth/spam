(function() {
  'use strict';

  angular
    .module('spam')
    .config(routing);

  var html5mode = true;
  var hashPrefix = '!';
  var routes = {
    '/': {
      templateUrl: 'landing.html',
      title: '',
      access: 0
    },

    // **********
    // Login
    '/login': {
      templateUrl: 'login.html',
      controller: 'Login',
      title: 'Login',
      access: 0
    },

    // **********
    // Help page
    '/help/:subject*?': {
      templateUrl: 'help.html',
      controller: 'Help',
      title: 'Help',
      access: 0
    },

    '/help': {
      redirectTo: '/help/remember'
    },

    // **********
    // Page not found error
    '/401': {
      templateUrl: '401.html',
      title: 'Page not found',
      access: 0
    },

    // **********
    // guide
    '/guide': {
      templateUrl: 'guide/index.html',
      controller: 'GuideCtrl',
      title: 'Guide',
      access: 0
    },

    // **********
    // user - course overview
    '/~': {
      templateUrl: 'home/index.html',
      controller: 'Home',
      title: ':username',
      reloadOnSearch: false,
      access: 1
    },

    // *********
    // user - settings
    '/~/settings': {
      templateUrl: 'home/settings.html',
      controller: 'UserSettings',
      title: ':username\'s settings',
      access: 1
    },

    // *********
    // user - logout
    '/~/logout': {
      templateUrl: 'landing.html',
      controller: 'Logout',
      title : 'Logout',
      access: 1
    },

    // *********
    // user - add unofficial course
    '/~/courses/new': {
      templateUrl: 'courses/unofficial/edit.html',
      controller: 'Unofficial_edit',
      access: 1,
      title: 'Add unofficial Course'
    },

    // *********
    // courses - index
    '/courses': {
      templateUrl: 'courses/index.html',
      controller: 'Courses',
      title: 'Courses',
      reloadOnSearch: false,
      access: 0
    },

    // **********
    // courses - create or edit course
    '/courses/new': {
      templateUrl: 'courses/edit.html',
      controller: 'Course_edit',
      title: 'New Course',
      access: 32
    },

    // **********
    // courses - proposals
    // only visible to administrators/editors
    '/courses/proposals': {
      templateUrl: 'courses/proposals.html',
      controller: 'Course_proposals',
      title: 'Edit proposals',
      access: 32
    },

    // **********
    // courses - single view
    '/courses/:courseId': {
      templateUrl: 'courses/show.html',
      controller: 'CourseCtrl',
      title: ':course',
      access: 0
    },

    // **********
    // courses - edit single course
    '/courses/:courseId/edit': {
      templateUrl: 'courses/edit.html',
      controller: 'Course_edit',
      title: ':course :: Edit',
      access: 4
    },

    // **********
    // admin task index
    '/admin': {
      templateUrl: 'admin/index.html',
      title: 'Administration',
      access: 32
    },

    // **********
    // required for using relative root ('/') links
    '/.': {
      redirectTo: '/'
    }
  };


  /* @ngInject */
  function routing(
    $routeProvider,
    $locationProvider
  ) {
    $locationProvider.html5Mode(html5mode).hashPrefix(hashPrefix);

    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
        return Auth.authenticate($route.current.access);
      }
    };

    var templateUrlBase = 'partials/';

    // Initiate every route.
    angular.forEach(routes, function(options, route) {
      if (options.hasOwnProperty('templateUrl')) {
        options.templateUrl = templateUrlBase + options.templateUrl;
      }

      if (! options.hasOwnProperty('redirectTo')) {
        options.resolve = auth;
      }

      $routeProvider.when(route, options);
    });

    // Redirect everything else to the root/landing page.
    $routeProvider.otherwise({ redirectTo: '/' });
  }
})();
