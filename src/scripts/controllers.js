'use strict';

var spamControllersMain = 'spam.controllers.main';
angular.module(spamControllersMain, []);



/**
 * CONTROLLER: Root
 */
angular.module(spamControllersMain).controller('Root', function(
	$scope
) {

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
