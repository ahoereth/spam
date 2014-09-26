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

	/**
	 * Initializes the transcript data.
	 *
	 * TODO: Should cache everything so its only initialized once.
	 */
	self.init = function() {
		courses = [];
		for ( var i = user.courses.length - 1; i >= 0; i-- ) {
			self.course_put( user.courses[i], false );
		};

		init_fields();
		init_terms();
		init_facts();
		init_columns();

		return {
			fields : fields,
			terms  : terms,
			facts  : facts,
			columns: columns
		};
	};


	/**
	 * Updates course information.
	 *
	 * @param {course} c        course object reference with updated information
	 * @param {bool}   delegate
	 */
	self.course_put = function(c, delegate) {
		delegate = ! _.isUndefined( delegate ) ? delegate : true;

		if ( _.isUndefined(c) ) {
			return false;
		}

		c.grade = _.formatGrade(c.grade);

		if ( c.grade != c.old_grade && ( c.grade < 1 || c.grade > 4 ) ) {
			c.passed = false;
		} else {
			c.passed = c.passed || ( c.grade >= 1 && c.grade <= 4 ) ? true : false;
		}

		var f = get_field(c.enrolled_field_id);

		// did the course's field change?
		if ( c.enrolled_field_id != c.enrolled_field_id_old ) {
			// add to new field
			f.courses.push(c);

			if ( ! _.isUndefined(c.enrolled_field_id_old) ) {
				// remove from old field
				var f_old = get_field(c.enrolled_field_id_old, false);
				f_old.courses = _.without(f_old.courses, c);

				// notify old field
				if ( delegate ) {
					// we dont delegate here because we will delegate when changing the
					// current/new field
					self.field_changed(f_old, false);
				}
			}
		}

		// notify current/new field
		if ( delegate ) {
			self.field_changed(f, true);
		}


		// remember old field
		c.enrolled_field_id_old = c.enrolled_field_id;

		// get term
		var t = get_term(c.year, c.term);

		// only add if not already in there
		if ( _.isUndefined( _.find(t, c) ) ) {
			t.courses.push(c);

			// notify term
			if ( delegate ) {
				self.term_changed(t, true);
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


	/**
	 * Removes a course from it field and term.
	 *
	 * @param {course} c course object reference to remove
	 */
	self.course_removed = function(c) {
		var f = _.find(fields, {field_id : c.enrolled_field_id});
		f.courses = _.without(f.courses, c);
		self.field_changed(f);

		var t = terms[c.term+c.year];
		t.courses = _.without(t.courses, c);
		self.term_changed(t);
	};


	/**
	 * Updates field information.
	 *
	 * @param {int/field} f        field id or object reference
	 * @param {bool}      delegate
	 */
	self.field_changed = function( f, delegate ) {
		delegate = ! _.isUndefined( delegate ) ? delegate : true;

		f = _.isNumber(f) ? get_field(f) : f;

		var aggregate = aggregate_courses(f.courses, {
			compulsory: f.field_pm,
			optional: f.field_wpm
		});

		f.ects  = aggregate.ects;

		if ( _.isUndefined(f.auto_grade) ) {
			f.auto_grade = true;
			if ( _.isNumber(f.grade) ) {
				f.grade = _.formatGrade(f.grade);
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
				self.field_changed(1, delegate);
			}
		}


		if ( f.field_id == 1 ) {
			overhang.sum = 0;
			_.each(overhang, function(value, key) {
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
		// "open studies" "logic" and "statistics" are exceptions.
		f.bsc_relevant = f.ects.completed.percent == 100 && f.field_id > 3 ? true : false;


		// https://github.com/mgonto/restangular/issues/378
		Restangular.restangularizeElement( f.parentResource, f, f.route );

		if ( delegate ) {
			init_facts(true);
		}
	};


	/**
	 * Updates term information.
	 *
	 * @param {term} t        term object reference
	 * @param {bool} delegate
	 */
	self.term_changed = function(t, delegate) {
		delegate = ! _.isUndefined(delegate) ? delegate : true;

		if ( _.isUndefined(t) )
			return;

		t = _.assign(t, aggregate_courses(t.courses));

		return t;
	};


	/**
	 * Initializes all fields.
	 *
	 * @return {array} Initialized fields.
	 */
	function init_fields() {
		for ( var i = fields.length - 1; i >= 0; i-- ) {
			self.field_changed(fields[i], false);
		};

		// open studies has to be updated again because of overflowing courses
		self.field_changed(1, false);

		return fields;
	};


	/**
	 * Initialize all terms.
	 *
	 * @return {array} Initialized terms.
	 */
	function init_terms() {
		var fromYear = user.mat_year;
		var fromTerm = user.mat_term == 'S' ? 0 : 1;
		var toYear   = $rootScope.meta.nextTermYear;
		var toTerm   = $rootScope.meta.otherTerm == 'S' ? 0 : 1;

		_.forIn(terms, function(t) {
			self.term_changed(t);
		});

		// add missing terms
		for ( var y = fromYear; y <= toYear; y++ ) {
			for ( var t = fromTerm; t <= 1; t++ ) {
				var semester = terms[$rootScope.meta.terms[t] + y];

				if ( (y != toYear || t != toTerm) && _.isUndefined(semester) ) {
					get_term(y, $rootScope.meta.terms[t]);
				}
			}
			term = 0;
		}

		terms.currentTerm = get_term($rootScope.meta.currentTermYear, $rootScope.meta.term);
		terms.lastTerm    = get_term($rootScope.meta.lastTermYear,    $rootScope.meta.otherTerm);
		terms.nextTerm    = get_term($rootScope.meta.nextTermYear,    $rootScope.meta.otherTerm);

		return terms;
	};


	/**
	 * Initializes the facts object which contains information like the overall
	 * bachelor grade, overhanging credits etc.
	 *
	 * @param  {bool}    delegate
	 * @return {object} Initialized facts.
	 */
	function init_facts(delegate) {
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
			completed_bsc_relevant_optional: 0,
			oral_ects: 0,
			os_ects: 0
		};

		for ( var i = fields.length - 1; i >= 0; i-- ) {
			var field = fields[i];
			var grade = parseFloat(field.grade);

			facts.ects.enrolled              += field.ects.enrolled;
			facts.ects.completed.optional    += field.ects.completed.optional;
			facts.ects.completed.compulsory  += field.ects.completed.compulsory;

			facts.grade_overall              += grade;
			helpers.grade_overall_denominator++;

			if ( field.bsc_relevant ) {
				facts.grade_bachelor += grade;
				helpers.grade_bachelor_denominator++;
				helpers.completed_bsc_relevant_optional += field.ects.completed.optional;
			}

			// oral module examinations give extra credits for the open studies field
			if ( ! field.auto_grade ) {
				helpers.oral_ects += 3;
			}
		}

		// The "open studies" field can have 22 to 33 ects - depending on which
		// fields the student chose to complete.
		// A student can have a maximum of 57 bachelor relevant "optional" credits.
		var os = get_field(1);
		helpers.os_ects = 57 - helpers.completed_bsc_relevant_optional;
		helpers.os_ects = helpers.os_ects < 11 ? 22 + helpers.os_ects : 33;
		if ( os.field_wpm != helpers.os_ects ) {
			os.field_wpm = helpers.os_ects;
			self.field_changed(os, delegate);

			// If delegate is true init_facts() will be called from field_changed(),
			// otherwise we call it here.
			if ( ! delegate )
				init_facts();

			// We changed some essential data. The facts need to be completely
			// recalculated - therefore return here.
			return facts;
		}

		facts.ects.completed.sum += facts.ects.completed.optional + facts.ects.completed.compulsory;
		facts.grade_overall  = _.formatGrade(facts.grade_overall / helpers.grade_overall_denominator);
		facts.grade_bachelor = _.formatGrade(facts.grade_bachelor / helpers.grade_bachelor_denominator);

		return facts;
	};


	/**
	 * Initialize columns: An array of 3 objects each containing fields in a way
	 * the number of courses is split between them equally. Idea is to get a
	 * similar height for every column.
	 *
	 * @return {array} columns
	 */
	function init_columns() {
		columns = [[],[],[]];

		var order = [
				{idx: 0, courses: 0, fields: 0},
				{idx: 1, courses: 0, fields: 0},
				{idx: 2, courses: 0, fields: 0}
			];

		// Sort fields by the amount of courses they hold. Fields relevant for
		// the bachelor are always first!
		var sorted = _.sortBy(fields, function(field) {
			return field.bsc_relevant ? field.courses.length * 10 : field.courses.length;
		});


		for ( var i = sorted.length - 1; i >= 0; i-- ) {
			var field = sorted[i];

			columns[ order[0].idx ].push(field);
			order[0].courses += field.courses.length;
			order[0].fields++;
			order = _.sortBy(order, ['fields', 'courses']);
		}

		return columns;
	};


	/**
	 * Aggregate a given set of courses in order to get information like average
	 * grade, number of completed and compulsory credits etc.
	 *
	 * TODO: Needs refactoring!
	 *
	 * @param  {array}  courses        courses to aggregate
	 * @param  {object} available_ects available compulsory and optional credits -
	 *                                 required to calculate overhanging credits
	 * @return {object}                aggregated information
	 */
	function aggregate_courses(courses, available_ects) {
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

			if ( c.muted )
				continue;

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

				if ( !_.isEmpty(c.grade)  ) {
					data.grade += parseFloat(c.grade) * c.counting_ects;
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

		data.grade = _.formatGrade(data.grade / data.ects.completed.sum);

		return data;
	};


	/**
	 * Get field object by id.
	 *
	 * @param  {int}   field_id
	 * @return {field}          field object reference
	 */
	function get_field(field_id) {
		var field = _.find(fields, {field_id : field_id});

		// field not found
		if ( _.isUndefined(field) ) {
			// no field found yet, get the original
			field = _.cloneDeep( _.find(user.fields, { field_id: field_id }) );
			field.courses = [];
			fields.push(field);
		}

		return field;
	}


	/**
	 * Gets a term object by year and term information.
	 *
	 * @param  {int}    year 4 digit year
	 * @param  {string} term W/S
	 * @return {term}   term object reference
	 */
	function get_term(year, term) {
		term = term.toUpperCase();

		var t = terms[ term + year ];
		if ( _.isUndefined(t) ) {
			t = {
				year : year,
				term : term,
				abbr : term + year,
				courses : []
			};

			terms[ term + year ] = t;
		}

		return t;
	};

	return self;
});
