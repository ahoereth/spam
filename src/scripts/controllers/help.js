'use strict';

var spamControllersHelp = 'spam.controllers.help';
angular.module(spamControllersHelp, []);

/**
 * CONTROLLER: Help
 * ROUTE: /help
 *
 * Processes some route params
 */
angular.module(spamControllersHelp).controller('Help', function(
	$scope,
	$location,
	$routeParams
){
	$scope.opened =  $routeParams.subject || '';

	$scope.open = function(subject) {
		subject = $scope.opened != subject ? subject : '';

		// this (sadly) reloads the route
		$location.path("/help/" + subject);

		// add this as soon as the route reloading problem is fixed
		// $scope.opened = subject;
	};
});
