/**
 * Highly unobtrusive typeahead directive.
 *
 * https://gist.github.com/ahoereth/7829487
 */
angular.module('souffleur', []).directive('souffleur', function($timeout) {

	return {
		restrict: 'E',
		replace: true,
		scope: {
			model: '=ngModel',
			id: '@inputId',
			class: '@childClass',
			src: '='
		},
		controller: function($scope) {
			$scope.souffleur = '';

			/**
			 * Triggered on every keypress and reacts to keyCode 9 ("tab") only.
			 * Checks if the souffleur is currently suggesting something, if so fills it in
			 * and triggers the specified event.
			 */
			$scope.keydown = function( $event ) {
				if ( $event.keyCode != 9 ||
				     $event.shiftKey ||
				     typeof $scope.model === 'undefined' ||
				     $scope.souffleur === $scope.model ||
				     $scope.souffleur === '' ||
				     $scope.model === '' ) return;

				$event.preventDefault();
				$scope.model = $scope.souffleur;
			};

			/**
			 * Watches the model and looks for an appropriate suggestion in the specified source array.
			 */
			$scope.$watch('model', function( input ) {
				$scope.souffleur = '';
				if ( typeof input === 'undefined' || typeof $scope.src === 'undefined' || input === '' )
					return;

				for ( var i = 0, len = $scope.src.length; i < len; i++ ) {
					if ( ($scope.src[i] + '').substring(0, input.length).toLowerCase() == input.toLowerCase() )
						return $scope.souffleur = input + ($scope.src[i] + '').substring(input.length);
				}
			});

		},
		template:
			'<div class="ngx-souffleur">'+
				'<div class="{{class}}">{{souffleur}}</div>'+
				'<input type="text" class="{{class}}" id="{{id}}" ng-model="model" ng-keydown="keydown($event)">'+
			'</div>'
	};
});
