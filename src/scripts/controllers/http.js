'use strict';



/**
 * CONTROLLER: HttpNotice
 *
 * TODO: Add functionality for the user to hide the error message for now.
 */
angular.module('spam.controllers.http', []).controller('HttpNotice', function(
	$scope,
	$rootScope,
	_,
	httpIntercept
) {

	// default http state
	$rootScope.http = { error : false, permanentError : false, status: 201, errors : [] };


	/**
	 * Listen to the http:error event and update the status appropriately.
	 * Will result in a http error message being displayed to the user -
	 * the server still retries!
	 */
	$scope.$on( 'http:error', function(event, response) {
		$rootScope.http.error = true;
		$rootScope.http.status = response.status;

		if ( _.indexOf( $rootScope.http.errors, response.config.url ) == -1 )
			$rootScope.http.errors.push( response.config.url );
	});


	/**
	 * Listen to the http:error:resolved event and in result of this maybe hide
	 * the http error notice (if all errors have been resolved.)
	 */
	$scope.$on( 'http:error:resolved', function(event, response) {

		// remove the resolved error from the array
		var idx = _.indexOf( $rootScope.http.errors, response.config.url );
		if ( idx != -1 )
			$rootScope.http.errors = $rootScope.http.errors.splice(idx, 1);

		// are all errors resolved?
		if ( ! $rootScope.http.errors.length ) {
			$rootScope.http.error = false;
			$rootScope.http.status = response.status;
		}

	});


	/**
	 * Listen to the http:error:permanent event and update the error message appropriately.
	 */
	$scope.$on( 'http:error:permanent', function(event, response) {
		$rootScope.http.error = true;
		$rootScope.http.permanentError = true;
		$rootScope.http.status = response.status;
	});


	/**
	 * Resets the http errors and closes the notice.
	 */
	$scope.close = function() {
		httpIntercept.clear();
		$rootScope.http = { error : false, permanentError : false, status: 201, errors : [] };
	};

});
