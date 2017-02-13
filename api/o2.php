<?php
// Load secret configuration constants.
require_once 'config/o2.php';

// HTTP Headers.
header('Content-Type: application/json');
header('charset: utf8');
if (DEV) {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Allow-Methods: GET');
  header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization');
}

// GET Arguments.
$style = $_GET['style'];
$year = isset($_GET['year']) ? $_GET['year'] : null;
$term = isset($_GET['term']) ? $_GET['term'] : null;

$result = migrator($year, $term);

if ('text' === $style) {
  print_r($result);
} else {
  echo json_encode($result);
}

exit;


// *****************************************************************************
// *****************************************************************************
// *****************************************************************************
// Just function definitions below. Weird setup.


function migrator($year = null, $term = null) {
  $year = $year == null ? idate('Y') - 1 : (int) $year;
  $term = ('W' == $term || 'S' == $term) ? $term : 'W';


  $server = sprintf(
    '%s:host=%s;port=%s;dbname=%s',
    DB_TYPE, DB_HOST, DB_PORT, DB_NAME
  );
  $db = new PDO($server, DB_USER, DB_PASSWORD);
  $prefix = '';

  if (DEBUG) {
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  }

  $stmt = $db->prepare('SELECT
      l._o3_id,
      l.key,
      l.title,
      t.type,
      l.language,
      l.credits,
      l.term,
      l.year,
      l.minsem,
      l.hours,
      l.time,
      l.room,
      l.syllabus,
      l.comment,
      l.link,
      l.exam_status,
      -- uppercase noise in pgsql column names <3
       -- B.Sc.
      l."CS", l."CP", l."PC", l."MA", l."CL", l."AI", l."NS", l."NB",
      -- M.Sc.
      l."NSn", -- Neuroscience
      l."AIn", -- Artificial Intelligence
      l."CPn", -- Cognitive Psychology
      l."LCLn", -- Linguistics & Computational Linguistics
      l."NIRn", -- Neuroinformatics and Robotics
      l."PMCn", -- Philosophy of Mind and Cognition
      -- Doctorate Program
      l."GS",
      l.preliminary, -- only visible to administrators atm
      p.fname  AS p1f, p.lname  AS p1l, p.www  AS p1w, p._o3_id  AS p1id,
      p2.fname AS p2f, p2.lname AS p2l, p2.www AS p2w, p2._o3_id AS p2id,
      p3.fname AS p3f, p3.lname AS p3l, p3.www AS p3w, p3._o3_id AS p3id
    FROM lec l
      LEFT JOIN lecture_type t  ON l.type        = t.id
      LEFT JOIN exam_status  f  ON l.exam_status = f._o3_id
      LEFT JOIN o3_staff     p  ON l.teacher     = p._o3_id
      LEFT JOIN o3_staff     p2 ON l.teacher2    = p2._o3_id
      LEFT JOIN o3_staff     p3 ON l.teacher3    = p3._o3_id
    WHERE l.year = ? AND l.term = ?
    ORDER BY l.exam_status ASC, l.title ASC;'
  );

  $stmt->execute( array( $year, $term ) );

  $courses = array();

  while ( $r = $stmt->fetch( PDO::FETCH_ASSOC ) ) {
    if (
      //! preg_match( '/[0-9]\.[x0-9]+a?/', $r['key'] )          || // only valid keys
      preg_match( '/E ?N ?T ?F ?..? ?L ?L ?T/i', $r['title'] ) || // 'entfaellt'
      empty( $r['title'] )                                     || // no title
      empty( $r['year'] ) || empty( $r['term'] )               || // no year, no term
      $r['preliminary']                                           // preliminary
    ) continue;

    // get general course data
    $c = array(
      'o3_id'          => $r['_o3_id'],
      'code'           => normcode($r['key']),
      'course'         => utf8_encode(normwhite(normtitle($r['title']))),
      'short'          => '',
      'type'           => translate_type( $r['type'] ),
      'language'       => preg_match('/^[de](?:\/[de])?$/i', $r['language']) ?
                            strtoupper( $r['language'] ) : '',
      'ects'           => $r['credits'],
      'term'           => strtoupper($r['term']),
      'year'           => $r['year'],
      'semester'       => $r['minsem'],
      'hours'          => $r['hours'],
      'time'           => $r['time'],
      'room'           => $r['room'],
      'course_desc'    => utf8_encode(normwhite(preg_replace(
                            '/(<\/?b>|<br\/?>|<\/?p>)/i', '', $r['syllabus']
                          ))),
      'course_comment' => utf8_encode(normwhite($r['comment'])),
      'course_url'     => $r['link'] == 'http://www' ? '' : trim($r['link']),
      'teachers'       => array(),
      'fields'         => array(),
    );

    // get teachers
    $teachers = array( 'p1', 'p2', 'p3' );
    foreach ($teachers AS $p)
      if (! empty($r[ $p . 'l' ])) {
        $c['teachers'][] = array(
          'teacher'     => utf8_encode(normteacher($r[ $p . 'f' ] . ' ' . $r[ $p . 'l' ])),
          'teacher_url' => $r[ $p . 'w' ] == 'http://' ? '' : $r[ $p . 'w' ],
          'o3_id'       => $r[ $p . 'id'],
        );
      }

    // get optional compulsory B.Sc. fields
    $fields = array(
      'CS' => 'INF',
      'CP' => 'KNP',
      'PC' => 'PHIL',
      'MA' => 'MAT',
      'CL' => 'CL',
      'AI' => 'KI',
      'NS' => 'NI',
      'NB' => 'NW'
    );

    foreach ($fields AS $o => $n) {
      if ($r[ $o ] && ! in_array($n, $c['fields'])) {
        $c['fields'][ $n ] = 'WPM';
      }
    }

    // get (single) compulsory B.Sc. field which can overwrite the optional compulsory
    $compulsory = array(
      '2836' => 'WM',
      '2832' => 'SD',
      '2833' => 'LOG',
      '2827' => 'INF',
      '2830' => 'KNP',
      '2834' => 'PHIL',
      '2825' => 'MAT',
      '2829' => 'CL',
      '2828' => 'KI',
      '2831' => 'NI',
      '2826' => 'NW',
    );

    if (isset($compulsory[ $r['exam_status'] ])) {
      $c['fields'][ $compulsory[ $r['exam_status'] ] ] =
        $compulsory[ $r['exam_status'] ] == 'WM' ? 'WM' : 'PM';
    }

    // get M.Sc. fields
    $fields = array(
      'NSn' => 'NS',
      'AIn' => 'AI',
      'CPn' => 'CP',
      'LCLn' => 'LCL',
      'NIRn' => 'NIR',
      'PMCn' => 'PMC'
    );

    foreach ($fields AS $o => $n) {
      if ($r[ $o ]) {
        $c['fields'][ $n ] = 'MSC';
      }
    }

    // get PHD field
    if ($r['GS']) {
      $c['fields']['PHD'] = 'PHD';
    }

    /*$fields = $c['fields'];
    $c['fields'] = array();
    foreach ($fields AS $field => $type) {
      $c['fields'][] = array(
        'field' => $field,
        'course_in_field_type' => $type,
      );
    }*/

    // MA MINOR??

    $courses[] = $c;
  }

  return $courses;
}


function normwhite($str) {
  $str = trim($str);
  $str = str_replace("\r", "\n", $str);
  $str = preg_replace(array('/\n+/', '/[\s\t]+/'), array("\n", ' '), $str);
  $str = str_replace(' )', ')', $str);
  return $str;
}


function normtitle( $str ) {
  //KOGW-MWPM-CL
  $pattern = array(
    "\(auch ",
    "(\(?(:?KP?O?W?G?W?-)?(MPM|MWPM|PM|WPM|WM|PWB|PBW)-?(LOG|MAT|SD|NW|CL|KI|PHIL|INF|NIR|KNP|AWA|KNP|IDK|NI|SP)?,? ?\)?)*",
    "\((Lecture|Vorlesung) (and|\+|&) (Practice|Tutorial|.bung)\)",
    "\(V\+.\)",
    "\(Weiterer? (Lehrender?|Mitwirkender?): [^\)]*\)", // TODO: Move those to teachers!
  );
  $str = preg_replace('/' . implode($pattern, '|') . '/i', '', $str);

  if (strpos($str, 'Seminar ')) {
    $str = str_replace('Seminar V',   'Seminar 5', $str);
    $str = str_replace('Seminar IV',  'Seminar 4', $str);
    $str = str_replace('Seminar III', 'Seminar 3', $str);
    $str = str_replace('Seminar II',  'Seminar 2', $str);
    $str = str_replace('Seminar I',   'Seminar 1', $str);
  }

  if (strpos($str, '&#776;')) {
    $str = str_replace('u&#776;', 'ü', $str);
    $str = str_replace('a&#776;', 'ä', $str);
    $str = str_replace('o&#776;', 'ö', $str);
    $str = str_replace('U&#776;', 'Ü', $str);
    $str = str_replace('A&#776;', 'Ä', $str);
    $str = str_replace('O&#776;', 'Ä', $str);
  }

  return $str;
}


function normcode($code) {
  $nullcodes = array('X.XXX', 'ohne Nummer');
  return in_array($code, $nullcodes) ? null : $code;
}


function normteacher($str) {
  $pattern = array(
    'apl. Prof. Dr.',
    ',?M\. ?Sc\.',
    'N\.'
  );

  return normwhite(preg_replace('/' . implode($pattern, '|') . '/i', '', $str));
}


function translate_type($type) {
  $trans = array(
    'L'  => 'L',  // Lecture
    'V'  => 'L',
    'S'  => 'S',  // Seminar
    'Ü'  => 'P',  // Practice
    'ü'  => 'P',
    'K'  => 'C',  // Colloquium
    'Pr' => 'SP', // Study Project
    'P'  => 'B',  // Blockpraktikum/Blockkurs/Praktikum
    'PS' => 'PS', // Proseminar
  );

  return isset($trans[ $type ]) ? $trans[ $type ] : $type;
}
