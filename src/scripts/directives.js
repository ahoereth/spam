angular.module('spam.directives', []);

angular.module('spam.directives').directive('addRemoveCourse', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			course: '=course',
			btnClass: '@',
			addCourse: '=',
			removeCourse: '='
		},
		template:
			'<div>'+
				'<div ng-if="!course.singleField&&!course.student_in_course_id&&!course.enrolled" class="btn-group" ng-class="{open : course.open}" style="width: 100%">'+
					'<a class="btn btn-success dropdown-toggle {{btnClass}}">'+
						'<span class="glyphicon glyphicon-plus"></span>'+
					'</a>'+
					'<ul class="dropdown-menu pull-right">'+
						'<li ng-repeat="field in course.fields" ng-class="{active : course.li==$index}">'+
							'<a style="cursor: pointer;" ng-click="addCourse(course.course_id, field.field_id)">'+
								'{{field.field}}'+
							'</a>'+
						'</li>'+
					'</ul>'+
				'</div>'+
				'<a class="btn btn-success {{btnClass}}" ng-if="!course.student_in_course_id&&(course.singleField||course.enrolled)" ng-disabled="course.enrolled" ng-class="{disabled : course.enrolled}" ng-click="addCourse(course.course_id, course.singleField)">'+
					'<span class="glyphicon glyphicon-plus"></span>'+
				'</a>'+
				'<a class="btn btn-danger {{btnClass}}" ng-show="course.student_in_course_id" ng-disabled="!course.enrolled" ng-class="{disabled : !course.enrolled}" ng-click="removeCourse(course)">'+
					'<span class="glyphicon glyphicon-minus"></span>'+
				'</a>'+
			'</div>'
	};
});
