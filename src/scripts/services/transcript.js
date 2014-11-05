angular.module('services.transcript', []).


factory('Transcript', function (
	$rootScope,
	Restangular,
	_
) {
	var self = {};
	var user, facts, courses, fields, terms, columns, overhang;


	/**
	 * Initializes the transcript data.
	 *
	 * TODO: Should cache everything so its only initialized once.
	 */
	self.init = function(userReference) {
		var first_init = _.isEmpty(user);
		if ( first_init ) {
			self.reset();
			user = userReference;
		}

		for ( var i = user.courses.length - 1, course; i >= 0; i-- ) {
			course = user.courses[i];
			if ( ! course.in_transcript ) {
				self.course_put(course, !first_init);
				course.in_transcript = true;
			}
		};

		if ( first_init ) {
			init_fields();
			init_terms();
			init_facts();
			init_columns();
		}

		return {
			fields : fields,
			terms  : terms,
			facts  : facts,
			columns: columns
		};
	};


	/**
	 * Resets all local data variables. Is for example called on user log out.
	 */
	self.reset = function() {
		user     = {};
		facts    = {};
		courses  = [];
		fields   = [];
		terms    = [];
		columns  = [];
		overhang = {};
	};


	/**
	 * Updates course information.
	 *
	 * @param {course} c        course object reference with updated information
	 * @param {bool}   delegate
	 */
	self.course_put = function(c, delegate) {
		delegate = ! _.isUndefined(delegate) ? delegate : true;

		if ( _.isUndefined(c) ) {
			return false;
		}

		c.grade = _.formatGrade(c.grade, true);
		c.term_abbr = c.term + c.year;

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
		if ( ! _.find(t.courses, c) ) {
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
	self.field_changed = function(f, delegate) {
		delegate = ! _.isUndefined(delegate) ? delegate : true;

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
				f.bsc_relevant = true;
			}
		}

		if ( f.auto_grade ) {
			f.grade = aggregate.grade;
		}

		f.ects.compulsory = f.field_pm;
		f.ects.optional   = f.field_wpm;
		f.ects.sum = f.ects.compulsory + f.ects.optional;
		f.ects.completed.overhang = 0;

		if ( f.ects.completed_compulsory > f.ects.compulsory ) {
			f.ects.completed.optional  += f.ects.completed.compulsory - f.ects.compulsory;
			f.ects.completed.compulsory = f.ects.compulsory;
		}

		if ( f.ects.completed.optional > f.ects.optional ) {
			f.ects.completed.overhang += f.ects.completed.optional - f.ects.optional;
			f.ects.completed.optional  = f.ects.optional;
		}

		// module examinations give 3 additional credits
		if ( ! f.auto_grade ) {
			f.ects.completed.overhang += 3;
		}

		f.ects.completed.sum = f.ects.completed.optional + f.ects.completed.compulsory;


		if ( overhang[f.field_id] != f.ects.completed.overhang ) {
			overhang[f.field_id] = f.ects.completed.overhang;

			if ( delegate && f.field_id != 1 ) {
				self.field_changed(1, delegate);
			}
		}


		if ( f.field_id == 1 ) {
			overhang.final = 0;
			overhang.sum = 0;
			_.each(overhang, function(value, key) {
				if ( key === 'sum' || key === 'final' || key == 1 ) {
					return;
				}

				overhang.sum += value;
			});

			f.ects.completed.optional += f.ects.completed.overhang + overhang.sum;
			f.ects.completed.sum = f.ects.completed.optional + f.ects.completed.compulsory;
			if ( f.ects.completed.sum > f.ects.sum ) {
				f.ects.completed.overhang = f.ects.completed.sum - f.ects.sum;
				f.ects.completed.sum      = f.ects.sum;
				overhang.final = f.ects.completed.overhang;
			}
		}

		f.ects.open_compulsory = f.ects.compulsory - (f.ects.completed.compulsory + f.ects.enrolled.compulsory);
		f.ects.open = f.ects.sum - (f.ects.completed.sum + f.ects.enrolled.sum + f.ects.open_compulsory);

		f.ects.completed.percent       = _.percent(f.ects.completed.sum, f.ects.sum);
		f.ects.enrolled_percent        = _.percent(f.ects.enrolled.sum, f.ects.sum);
		f.ects.open_compulsory_percent = _.percent(f.ects.open_compulsory, f.ects.sum);
		f.ects.open_percent            = _.percent(f.ects.open, f.ects.sum);

		// Relevant for the bachelor grade?
		// "open studies" "logic" and "statistics" are exceptions.
		f.bsc_relevant = ( f.ects.completed.percent == 100 || ! f.auto_grade ) && f.field_id > 3 ? true : false;


		// https://github.com/mgonto/restangular/issues/378
		Restangular.restangularizeElement( f.parentResource, f, f.route );

		if ( delegate ) {
			self.facts_changed(true);
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



	self.facts_changed = function(delegate) {
		init_facts(delegate);
	};


	/**
	 * Initializes all fields.
	 *
	 * @return {array} Initialized fields.
	 */
	function init_fields() {
		for ( var i = user.fields.length - 1; i >= 0; i-- ) {
			self.field_changed(user.fields[i].field_id, false);
		}

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

			facts.ects.enrolled              += field.ects.enrolled.sum;
			facts.ects.completed.optional    += field.ects.completed.optional;
			facts.ects.completed.compulsory  += field.ects.completed.compulsory;

			if ( _.isNumeric(grade) ) {
				facts.grade_overall              += grade
				helpers.grade_overall_denominator++;

				if ( field.bsc_relevant ) {
					helpers.completed_bsc_relevant_optional += field.ects.completed.optional;

					// fields count double
					facts.grade_bachelor += grade;
					helpers.grade_bachelor_denominator++;
				}

				// oral module examinations give extra credits for the open studies field
				if ( ! field.auto_grade ) {
					helpers.oral_ects += 3;
				}
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

		// bsc grade = (fields*2 + thesis) / 3
		if ( user.thesis_grade ) {
			facts.grade_bachelor *= 2;
			facts.grade_bachelor += parseFloat(user.thesis_grade);
			facts.grade_bachelor = _.formatGrade(facts.grade_bachelor / 3);
			facts.ects.completed.sum += 12;
		}

		// calculate average ects per semester, only considering key.length 5
		// because of "next", "last" and "current" semester information
		var average_ects = 0, average_ects_denominator = 0;
		_.forIn(terms, function(term, key) {
			if ( key.length == 5 && term.ects && term.ects.completed.sum ) {
				average_ects += term.ects.completed.sum;
				average_ects_denominator++;
			}
		});
		facts.average_ects = (average_ects / average_ects_denominator).toFixed(1);

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
	 * @param  {array}  courses        courses to aggregate
	 * @param  {object} available_ects available compulsory and optional credits -
	 *                                 required to calculate overhanging credits
	 * @return {object}                aggregated information
	 */
	function aggregate_courses(courses, available_ects) {
		available_ects = available_ects || false;

		var data = {
			ects: {
				completed: {
					optional: 0,
					compulsory: 0,
					sum: 0,
					overhang: 0
				},
				enrolled: {
					optional: 0,
					compulsory: 0,
					sum: 0
				}
			},
			grade: 0
		};

		var grade_denominator = 0;

		for ( var i = courses.length - 1; i >= 0; i-- ) {
			var c = courses[i];
			var type = c.enrolled_course_in_field_type == 'PM' ? 'compulsory' : 'optional';

			if ( c.muted )
				continue;

			var completed = data.ects.completed[ type ];
			var completed_new = completed + c.ects;
			var counting_ects = c.ects;

			if ( c.passed ) {

				if ( available_ects ) {
					var available = available_ects[ type ];

					if ( completed >= available ) {
						counting_ects = 0;
						c.doesnt_count = true;
						data.ects.completed.overhang += c.ects;
					} else if ( completed_new > available ) {
						counting_ects = c.ects - (completed_new - available);
						data.ects.completed[ type ]  += counting_ects;
						data.ects.completed.overhang += c.ects - counting_ects;
					} else { // if ( completed_new <= available )
						data.ects.completed[ type ] = completed_new;
					}

				} else { // if ( ! available_ects )
					data.ects.completed[ type ] = completed_new;
				}

				if ( !_.isEmpty(c.grade) ) {
					// ugly rounding required because of internal javascript calculation inaccuracies
					data.grade = Math.round( ( data.grade + (parseFloat(c.grade) * counting_ects) ) * 100 ) / 100;
					grade_denominator += counting_ects;
				}
			} else {
				data.ects.enrolled[ type ] += c.ects;
			}
		}

		data.ects.completed.sum = data.ects.completed.compulsory + data.ects.completed.optional;
		data.ects.enrolled.sum  = data.ects.enrolled.compulsory  + data.ects.enrolled.optional;

		var maxEnrolled = ( available_ects.optional + available_ects.compulsory ) - data.ects.completed.sum;
		if ( data.ects.enrolled.sum > maxEnrolled ) {
			data.ects.overhang = data.ects.enrolled.sum - maxEnrolled;
			data.ects.enrolled.sum = maxEnrolled;
		}

		data.grade = _.formatGrade(data.grade / grade_denominator);

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
		term = term || $rootScope.meta.term;
		year = year || $rootScope.meta.currentTermYear;

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
