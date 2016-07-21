-- Sets up the raw database without any values.


--
-- TABLE users
--
-- rank
--    0 - default: not a user
--    1 - user
--    2 - verified user (registered using ldap)
--    4 - approved user with multiple course edits approved
--    8 - teacher
--   16 - editor
--   32 - admin
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS users (
  username        VARCHAR(255),
  pass            VARCHAR(255),
  rank            SMALLINT DEFAULT 0,
  role            VARCHAR(32) DEFAULT '',
  special         TINYINT DEFAULT 0,
  accepted_edits  INTEGER UNSIGNED DEFAULT 0,
  dismissed_edits INTEGER UNSIGNED DEFAULT 0,
  uos_ldap        TIMESTAMP DEFAULT 0,
  request_count   INTEGER UNSIGNED DEFAULT 0,
  request_reset   TIMESTAMP DEFAULT 0,
  registered      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login      TIMESTAMP DEFAULT 0,
  PRIMARY KEY (username)
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE teachers
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS teachers (
  teacher_id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  teacher     VARCHAR(255) UNIQUE,
  teacher_url VARCHAR(255),
  username    VARCHAR(255) UNIQUE REFERENCES users ON UPDATE CASCADE ON DELETE SET NULL,
  PRIMARY KEY (teacher_id),
  INDEX (teacher)
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE courses
--
-- No ects is here, they are regulation dependent.
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS courses (
  course_id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code             VARCHAR(255),          -- course number, e.g. 8.3124
  course           VARCHAR(255) NOT NULL, -- course title
  ects             SMALLINT DEFAULT 0,
  type             VARCHAR(2),            -- L/S/K/P for lecture or seminar
  language         VARCHAR(3),            -- EN/DE
  term             CHAR(1),               -- W/S for winter or summer term
  year             SMALLINT,
  semester         SMALLINT,
  hours            SMALLINT,
  course_desc      TEXT,
  course_notice    TEXT,
  course_url       TEXT,
  studip_url       TEXT,
  preliminary      BOOLEAN NOT NULL DEFAULT FALSE,
  added            TIMESTAMP DEFAULT 0,
  modified         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by      VARCHAR(255),
  parent_course_id BIGINT UNSIGNED,
  PRIMARY KEY (course_id),
  FOREIGN KEY (modified_by)      REFERENCES users(username)   ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (parent_course_id) REFERENCES courses(course_id) ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX (course),
  INDEX (course, year),
  INDEX (course, year, term),
  INDEX (year),
  INDEX (year, term)
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE o3_relations
--
-- Relation to the courses in the o3 database.
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS o3_relations (
  o3_id          BIGINT UNSIGNED PRIMARY KEY,
  course_id      BIGINT UNSIGNED,
  teacher_id     BIGINT UNSIGNED,
  matched        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id)  REFERENCES courses(course_id)   ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON UPDATE CASCADE ON DELETE CASCADE
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE teachers_in_courses
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS teachers_in_courses (
  teacher_id BIGINT UNSIGNED,
  course_id  BIGINT UNSIGNED,
  teacher_in_course_position SMALLINT UNSIGNED,
  PRIMARY KEY (teacher_id, course_id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(course_id)   ON UPDATE CASCADE ON DELETE CASCADE
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE regulations
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS regulations (
  regulation_id    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  regulation_abbr  VARCHAR(32),
  regulation_title VARCHAR(3),
  regulation       VARCHAR(255),
  regulation_desc  TEXT,
  invisible        BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (regulation_id)
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE fields
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS fields (
  field_id      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  field_abbr    VARCHAR(4),
  field         VARCHAR(255),
  field_desc    TEXT,
  field_examination_possible BOOLEAN NOT NULL DEFAULT FALSE
  PRIMARY KEY (field_id),
  INDEX (field)
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE fields_in_regulations
--
-- @since 0.2
--
CREATE TABLE IF NOT EXISTS fields_in_regulations (
  field_in_regulation_id BIGINT   UNSIGNED NOT NULL AUTO_INCREMENT,
  field_id               BIGINT   UNSIGNED,
  regulation_id          BIGINT   UNSIGNED,
  field_pm               SMALLINT UNSIGNED,
  field_wpm              SMALLINT UNSIGNED,
  PRIMARY KEY (field_in_regulation_id),
  UNIQUE (field_id, regulation_id),
  FOREIGN KEY (field_id)      REFERENCES fields(field_id)           ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (regulation_id) REFERENCES regulations(regulation_id) ON UPDATE CASCADE ON DELETE CASCADE
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE courses_in_fields
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS courses_in_fields (
  #course_in_field_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  course_id                BIGINT UNSIGNED,
  field_id                 BIGINT UNSIGNED,
  course_in_field_type     VARCHAR(3), -- WPM / PM / PM2 (secondary)
  PRIMARY KEY (course_id, field_id),
  #UNIQUE (course_id, field_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (field_id)  REFERENCES fields(field_id)   ON UPDATE CASCADE ON DELETE CASCADE
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE students
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS students (
  username      VARCHAR(255),
  regulation_id BIGINT UNSIGNED,
  firstname     VARCHAR(255),
  lastname      VARCHAR(255),
  mat_term      CHAR(1),
  mat_year      SMALLINT,
  mat_verify    BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (username),
  FOREIGN KEY (username)      REFERENCES users(username)            ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (regulation_id) REFERENCES regulations(regulation_id) ON UPDATE CASCADE ON DELETE RESTRICT
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE students_in_courses
--
-- grade:
--   = 0         : enrolled
--   > 1 && <= 4 : completed
--   = 5         : failed
--
-- course_id is required, course_in_field_in_regulation_id is optional and NULL
-- if course is not assigned to any field - then the course will be used for
-- the "open studies" field.
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS students_in_courses (
  student_in_course_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username             VARCHAR(255),
  course_id            BIGINT UNSIGNED,
  field_id             BIGINT UNSIGNED,
  regulation_id        BIGINT UNSIGNED,
  grade                DECIMAL(2,1) CHECK (grade>=0 AND grade<=5),
  passed               BOOLEAN      NOT NULL DEFAULT FALSE,
  muted                BOOLEAN      NOT NULL DEFAULT FALSE,
  unofficial_course    VARCHAR(255),
  unofficial_ects      SMALLINT,
  unofficial_code      VARCHAR(255),
  unofficial_term      CHAR(1),
  unofficial_year      SMALLINT,
  PRIMARY KEY (student_in_course_id),
  UNIQUE (username, course_id, regulation_id),
  FOREIGN KEY (username)      REFERENCES students(username)         ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (course_id)     REFERENCES courses(course_id)         ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (field_id)      REFERENCES fields(field_id)           ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (regulation_id) REFERENCES regulations(regulation_id) ON UPDATE CASCADE ON DELETE SET NULL
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE students_in_fields
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS students_in_fields (
  student_in_field_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username            VARCHAR(255),
  field_id            BIGINT UNSIGNED,
  regulation_id       BIGINT UNSIGNED,
  grade               DECIMAL(2,1) CHECK (grade>=0 AND grade<=5),
  PRIMARY KEY (student_in_field_id),
  UNIQUE (username, field_id, regulation_id),
  INDEX (username),
  FOREIGN KEY (username)      REFERENCES students(username)         ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (field_id)      REFERENCES courses(course_id)         ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (regulation_id) REFERENCES regulations(regulation_id) ON UPDATE CASCADE ON DELETE SET NULL
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE students_in_regulations
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS students_in_regulations (
  student_in_regulation_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username                 VARCHAR(255),
  regulation_id            BIGINT UNSIGNED,
  thesis_title             TEXT,
  thesis_grade             DECIMAL(2,1) CHECK (grade>=0 AND grade<=5),
  PRIMARY KEY (student_in_regulation_id),
  UNIQUE (username, regulation_id),
  INDEX (username),
  FOREIGN KEY (username)      REFERENCES students(username)         ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (regulation_id) REFERENCES regulations(regulation_id) ON UPDATE CASCADE ON DELETE CASCADE
) COLLATE utf8_unicode_ci ENGINE=INNODB;


--
-- TABLE guide
--
-- @since 0.1
--
CREATE TABLE IF NOT EXISTS guide (
  course_id          BIGINT UNSIGNED,
  field_id           BIGINT UNSIGNED,
  guide_semester     SMALLINT UNSIGNED,
  guide_desc         TEXT,
  guide_inc          BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (field_id, course_id),
  FOREIGN KEY (course_id, field_id) REFERENCES courses_in_fields(course_id, field_id) ON UPDATE CASCADE ON DELETE CASCADE
) COLLATE utf8_unicode_ci ENGINE=INNODB;
