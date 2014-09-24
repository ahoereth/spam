angular.module('services.transcript', []).


factory('Transcript', function (
	$rootScope,
	Restangular,
	_
) {
	var user = $rootScope.user;

	var self     = {},
	    facts    = {},
	    courses  = [],
	    fields   = [],
	    terms    = [],
	    columns  = [],
	    overhang = {};

	self.init = function() {
		if ( _.isEmpty( courses ) ) {
			for ( var i = user.courses.length - 1; i >= 0; i-- ) {
				self.course_put( user.courses[i], false );
			};
		}

		fields_init();
		terms_init();
		facts_init();
		columns_init();

		return {
			fields : fields,
			terms  : terms,
			facts  : facts,
			columns: columns
		};
	};


	self.course_removed = function(c) {
		var f = _.find(fields, {field_id : c.enrolled_field_id});
		f.courses = _.without(f.courses, c);
		self.field_changed(f);

		var t = terms[c.term+c.year];
		t.courses = _.without(t.courses, c);
		self.term_changed(t);
	};


	self.course_put = function(c, delegate) {
		delegate = ! _.isUndefined( delegate ) ? delegate : true;

		if ( _.isUndefined( c ) ) {
			return false;
		}

		c.grade = _.formatGrade( c.grade );

		if ( c.grade != c.old_grade && ( c.grade < 1 || c.grade > 4 ) ) {
			c.passed = false;
		} else {
			c.passed = c.passed || ( c.grade >= 1 && c.grade <= 4 ) ? true : false;
		}

		var f = self.field_get( c.enrolled_field_id );

		// did the course's field change?
		if ( c.enrolled_field_id != c.enrolled_field_id_old ) {
			// add to new field
			f.courses.push(c);

			if ( ! _.isUndefined( c.enrolled_field_id_old ) ) {
				// remove from old field
				var f_old = self.field_get( c.enrolled_field_id_old, false );
				f_old.courses = _.without( f_old.courses, c );

				// notify old field
				if ( delegate ) {
					// we dont delegate here because we will delegate when changing the
					// current/new field
					self.field_changed( f_old, false );
				}
			}
		}

		// notify current/new field
		if ( delegate ) {
			self.field_changed( f, true );
		}


		// remember old field
		c.enrolled_field_id_old = c.enrolled_field_id;

		// get term
		var t = self.term_get( c.year, c.term );

		// only add if not already in there
		if ( _.isUndefined( _.find( t, c ) ) ) {
			t.courses.push( c );

			// notify term
			if ( delegate ) {
				self.term_changed( t, true );
			}
		}

		// save changes to server
		if ( delegate ) {
			c.put();
		}

		// remember old grade
		c.old_grade = c.grade;

		return {course: c, field: f, term: t};
	};


	self.field_changed = function( f, delegate ) {
		delegate = ! _.isUndefined( delegate ) ? delegate : true;

		f = _.isNumber( f ) ? self.field_get( f ) : f;

		var aggregate = self.aggregate_courses( f.courses, {
			compulsory: f.field_pm,
			optional: f.field_wpm
		});

		f.ects  = aggregate.ects;

		if ( _.isUndefined( f.auto_grade ) ) {
			f.auto_grade = true;
			if ( _.isNumber( f.grade ) ) {
				f.grade = _.formatGrade( f.grade );
				f.auto_grade = false;
			}
		}

		if ( f.auto_grade ) {
			f.grade = aggregate.grade;
		}

		f.ects.compulsory = f.field_pm;
		f.ects.optional   = f.field_wpm;
		f.ects.sum = f.ects.compulsory + f.ects.optional;

		if ( f.ects.completed_compulsory > f.ects.compulsory ) {
			f.ects.completed.optional  += f.ects.completed.compulsory - f.ects.compulsory;
			f.ects.completed.compulsory = f.ects.compulsory;
		}

		if ( f.ects.completed.optional > f.ects.optional ) {
			f.ects.completed.overhang = f.ects.completed.optional - f.ects.optional;
			f.ects.completed.optional = f.ects.optional;
		}

		f.ects.completed.sum = f.ects.completed.optional + f.ects.completed.compulsory;


		if ( overhang[f.field_id] != f.ects.completed.overhang ) {
			overhang[f.field_id] = f.ects.completed.overhang;

			if ( delegate && f.field_id != 1 ) {
				self.field_changed( 1, delegate );
			}
		}


		if ( f.field_id == 1 ) {
			overhang.sum = 0;
			_.each( overhang, function( value, key ) {
				if ( key === 'sum' || key === 'final' || key == 1 ) {
					return;
				}

				overhang.sum += value;
			});
			overhang.final = overhang.sum + f.ects.completed.overhang;
			f.ects.completed.sum += overhang.final;

			if ( f.ects.completed.sum > f.ects.sum ) {
				f.ects.completed.overhang = f.ects.completed.sum - f.ects.sum;
				f.ects.completed.sum      = f.ects.sum;
			}
		}

		f.ects.rest = f.ects.sum - f.ects.completed.sum - f.ects.enrolled - f.ects.compulsory + f.ects.completed.compulsory;

		f.ects.completed.percent  = _.percent(f.ects.completed.sum, f.ects.sum);
		f.ects.compulsory_percent = _.percent(f.ects.compulsory - f.ects.completed.compulsory, f.ects.sum);
		f.ects.enrolled_percent   = _.percent(f.ects.enrolled, f.ects.sum);
		f.ects.rest_percent       = _.percent(f.ects.rest, f.ects.sum);

		// Relevant for the bachelor grade?
		// "open studies" (field_id == 1) always, "logic" and "statistics" never
		f.bsc_relevant = (
				( f.field_id == 1 ) ||
				( f.ects.completed.percent == 100 && f.field_id > 3 )
			) ? true : false;


		// https://github.com/mgonto/restangular/issues/378
		Restangular.restangularizeElement( f.parentResource, f, f.route );

		if ( delegate ) {
			facts_init( delegate );
			$rootScope.$broadcast( "fieldsChanged", fields );
		}
	};


	self.term_changed = function( t, delegate ) {
		delegate = ! _.isUndefined(delegate) ? delegate : true;

		if ( _.isUndefined(t) )
			return;

		t = _.assign(t, self.aggregate_courses(t.courses));

		return t;
		//$rootScope.$broadcasangulart("termsChanged", terms);
	};


	var facts_init = function( delegate ) {
		delegate = ! _.isUndefined(delegate) ? delegate : true;

		facts = _.assign(facts, {
			ects: {
				completed: {
					compulsory: 0,
					optional: 0,
					sum: 0,
					floated: overhang.sum,
					overhang: overhang.final
				},
				compulsory: 0,
				optional: 0,
				enrolled: 0,
				sum: 0
			},
			grade_overall  : 0,
			grade_bachelor : 0
		});

		var helpers = {
			grade_overall_denominator: 0,
			grade_bachelor_denominator: 0,
			os: {},
			ects_without_os: 0
		};

		for (var i = fields.length - 1; i >= 0; i--) {
			var field = fields[i];

			facts.ects.enrolled              += field.ects.enrolled;
			facts.ects.completed.optional    += field.ects.completed.optional;
			facts.ects.completed.compulsory  += field.ects.completed.compulsory;

			facts.grade_overall              += parseFloat(field.grade);
			helpers.grade_overall_denominator++;

			if ( field.field_id == 1 ) {
				helpers.os = field;
			}
		}


		helpers.os_ects = 79 - (facts.ects.completed.optional - helpers.os.ects.completed.optional);
		if ( helpers.os_ects < 33 && helpers.os.field_wpm == 33) {
			helpers.os.field_wpm = helpers.os_ects;
			self.field_changed(helpers.os, delegate);

			// if delegate is true we self.facts_init() will be called from
			// self.field_changed(). If its false he have to call it here.
			if ( ! delegate )
				facts_init();

			// We changed some essential data. The facts need to be completely
			// recalculated.
			return;
		}


		facts.ects.completed.sum += facts.ects.completed.optional + facts.ects.completed.compulsory;
		facts.grade_overall = _.formatGrade( facts.grade_overall / helpers.grade_overall_denominator );


		if (delegate) {
			$rootScope.$broadcast("factsChanged", facts);
		}
	};


	self.aggregate_courses = function( courses, available_ects ) {
		available_ects = available_ects || { optional: 999, compulsory: 999 };

		var data = {
			ects: {
				completed: {
					optional: 0,
					compulsory: 0,
					sum: 0,
					overhang: 0
				},
				enrolled: 0
			},
			grade: 0
		};

		var helpers = {
			grade_denominator: 0
		};

		for ( var i = courses.length - 1; i >= 0; i-- ) {
			var c = courses[i], tmp, ectstarget;

			if ( c.muted ) {
				continue;
			}

			type = c.enrolled_course_in_field_type == 'PM' ? 'compulsory' : 'optional';

			if ( c.passed ) {
				c.counting_ects = c.ects;
				tmp = data.ects.completed[ type ] + c.ects;
				if ( data.ects.completed[ type ] >= available_ects[ type ] ) {
					c.doesnt_count = true;
					data.ects.completed.overhang += c.ects;
				} else if ( tmp > available_ects[ type ] ) {
					data.ects.completed[ type ] = available_ects[ type ];
					c.counting_ects = tmp - available_ects[ type ];
					data.ects.completed.overhang += c.ects - c.counting_ects;
				} else {
					data.ects.completed[ type ] = tmp;
				}

				if ( ! _.isEmpty( c.grade )  ) {
					data.grade += parseFloat( c.grade ) * c.counting_ects;
				}
			} else {
				data.ects.enrolled += c.ects;
			}
		}

		data.ects.completed.sum = data.ects.completed.compulsory + data.ects.completed.optional

		var maxEnrolled = ( available_ects.optional + available_ects.compulsory ) - data.ects.completed.sum;
		if ( data.ects.enrolled > maxEnrolled ) {
			data.ects.overhang = data.ects.enrolled - maxEnrolled;
			data.ects.enrolled = maxEnrolled;
		}

		data.grade = _.formatGrade( data.grade / data.ects.completed.sum );

		return data;
	};


	var terms_init = function() {
		var fromYear = user.mat_year;
		var fromTerm = user.mat_term == 'S' ? 0 : 1;
		var toYear   = $rootScope.meta.nextTermYear;
		var toTerm   = $rootScope.meta.otherTerm == 'S' ? 0 : 1;

		_.forIn(terms, function(t) {
			self.term_changed(t);
		});

		// add missing terms
		for (var y = fromYear; y <= toYear; y++) {
			for (var t = fromTerm; t <= 1; t++) {
				var semester = terms[$rootScope.meta.terms[t] + y];

				if ( (y != toYear || t != toTerm) && _.isUndefined(semester) ) {
					self.term_get(y, $rootScope.meta.terms[t]);
				}
			}
			term = 0;
		}

		terms.currentTerm = self.term_get($rootScope.meta.currentTermYear, $rootScope.meta.term);
		terms.lastTerm    = self.term_get($rootScope.meta.lastTermYear, $rootScope.meta.otherTerm);
		terms.nextTerm    = self.term_get($rootScope.meta.nextTermYear, $rootScope.meta.otherTerm);

		$rootScope.$broadcast("termsChanged", terms);
	};


	/**
	 * Generates an array of 3 objects from all fields.
	 * Fields are distributed between the 3 objects so that in the end the printed
	 * columns should have similar height.
	 *
	 * @return {array}  columns
	 */
	var columns_init = function() {
		columns = [[],[],[]];

		var order = [
				{idx: 0, courses: 0, fields: 0},
				{idx: 1, courses: 0, fields: 0},
				{idx: 2, courses: 0, fields: 0}
			];

		var sorted = _.sortBy(fields, function(field) {
			return field.courses.length;
		});


		for (var i = sorted.length - 1; i >= 0; i--) {
			var field = sorted[i];

			columns[ order[0].idx ].push(field);
			order[0].courses += field.courses.length;
			order[0].fields++;
			order = _.sortBy( order, ['fields', 'courses'] );
		}

		return columns;
	};

	var fields_init = function() {
		for (var i = fields.length - 1; i >= 0; i--) {
			self.field_changed(fields[i], false);
		};

		// open studies has to be updated again because of overflowing courses
		self.field_changed(1, false);
	};

	self.field_get = function(field_id, delegate) {
		delegate = ! _.isUndefined(delegate) ? delegate : true;

		// get field
		var f = _.find(fields, {field_id : field_id});

		// field not found
		if ( _.isUndefined(f) ) {
			// no field found yet, get the original
			f = _.cloneDeep( _.find( user.fields, { field_id : field_id } ) );
			f.courses = [];
			fields.push(f);
		}

		return f;
	}


	self.term_get = function(year, term) {
		var t = terms[term+year];
		if ( _.isUndefined(t) ) {
			t = {
				year : year,
				term : term,
				abbr : term + year,
				courses : []
			};

			terms[term+year] = t;
		}

		return t;
	};

	return self;
});
