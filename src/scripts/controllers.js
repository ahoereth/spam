'use strict';

var spamControllersMain = 'spam.controllers.main';
angular.module(spamControllersMain, []);



/**
 * CONTROLLER: Root
 */
angular.module(spamControllersMain).controller('Root', function(
	$rootScope,
	$scope,
	DataHandler
) {
	DataHandler.userInit();

	$scope.$on('userDestroy', function(event) {
		DataHandler.removeAll();
		DataHandler.userInit();
	});
});



/**
 * CONTROLLER: Login
 * ROUTE: /login
 *
 * Login page which can get passed a username parameter for prefilling the username form field.
 * Further more it reacts to some different errors.
 */
angular.module(spamControllersMain).controller('Login', function(
	$scope,
	$routeParams
) {

	$scope.params = $routeParams;

});


/**
 * CONTROLLER: Loginform
 *
 * Contains the loginform functionality which triggers authentication and redirects
 * appropriately.
 */
angular.module(spamControllersMain).controller('Loginform', function(
	$rootScope,
	$scope,
	$location,
	Auth
) {
	$rootScope.loginform = { username : '' };

	/**
	 * User login
	 */
	$scope.login = function() {
		var t = this.loginform;
		t.loading = true;

		Auth.init(
			t.username,
			t.password,
			t.remember
		).then( function() {
			t.loading = false;

			if ($rootScope.user) {
				$rootScope.loginform = {};

				var targetRoute = _.isEmpty($rootScope.requested_route) ? '/~' : $rootScope.requested_route;
				$location.path(targetRoute);
			} else {
				$rootScope.loginform.password = '';
				$location.path('/login').search( { error : true } );
			}
		});
	};
});


/**
 * CONTROLLER: Alert
 *
 * Just provides functionality for the alert close button
 */
angular.module(spamControllersMain).controller('Alert', function($scope) {

	/**
	 * Hides the alert
	 */
	$scope.closeAlert = function () {
		this.$parent.alert = false;
	};

});



/**
 * CONTROLLER: Help
 * ROUTE: /help
 *
 * Processes some route params
 */
angular.module(spamControllersMain).controller('Help', function(
	$scope,
	$routeParams
){

	$scope.faqIn = $routeParams.faq;

	$scope.open =  $routeParams.faq || 'remember';

});
