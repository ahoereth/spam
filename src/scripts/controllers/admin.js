'use strict';
angular.module('spam.controllers.admin', []).


controller('Course_proposals', function(
	$rootScope,
	$scope,
	$location,
	$routeParams,
	_,
	Restangular
) {

	var fetch = function() {
		$scope.loading.courses = true;
		$scope.courses = Restangular.all('courses').all('preliminaries').getList().$object;
	};
	fetch();

	$scope.acceptProposal = function (course) {
		course.id = course.course_id;

		course.put().then(function( c ) {
			console.log( 'Proposed change accepted: ' + course.course_id + ' - ' + course.course );
			fetch();
		});
	};

	$scope.dismissProposal = function (course) {
		course.id = course.course_id;

		course.remove().then(function (c) {
			console.log( 'Proposed change dismissed: ' + course.course_id + ' - ' + course.course );
			fetch();
		});
	};

});
