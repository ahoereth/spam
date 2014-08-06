(function () {

	angular.module('helpFragment', []).directive('helpFragment', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: true,
			transclude: true,
			link: function(scope, elemt, attrs) {
				scope.slug  = attrs.slug;
				scope.title = attrs.title;
			},
			template:
				'<div class="panel panel-default">'+
					'<div class="panel-heading" ng-click="open(slug)">'+
						'<h2 class="panel-title">{{title}}</h2>'+
					'</div>'+
					'<div class="panel-body" ng-show="opened==slug">'+
						'<ng-transclude></ng-transclude>'+
					'</div>'+
				'</div>'
		};
	});
}());
