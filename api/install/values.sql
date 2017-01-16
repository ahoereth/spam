
--
-- VALUES regulations
--
INSERT INTO regulations ( invisible, regulation_abbr, regulation_title, regulation, examination_fields ) VALUES
  ( FALSE, 'uos_cogsci_bsc_11', 'BSc', 'Cognitive Science B.Sc. 2011', 5 ),
  ( FALSE, 'uos_cogsci_msc_06', 'MSc', 'Cognitive Science M.Sc. 2006', 2 ),
  ( FALSE, 'uos_cogsci_phd',    'PHD', 'Cognitive Science Doctorate Program', 0 ),
  ( TRUE,  'uos_cogsci_bsc_00', 'BSc', 'Cognitive Science B.Sc. 2000', 5 );


--
-- VALUES fields
--
-- TODO: Add field descriptions.
--
INSERT INTO fields ( field_examination_possible, field_abbr, field ) VALUES
  -- BSC
  ( FALSE, 'WM', 'Open Studies' ),
  ( FALSE, 'LOG', 'Logic' ),
  ( FALSE, 'SD', 'Statistics and Dataanalysis' ),
  ( TRUE,  'MAT', 'Mathematics' ),
  ( TRUE,  'INF', 'Computer Science' ),
  ( TRUE,  'KNP', 'Cognitive Neuropsychology' ),
  ( TRUE,  'PHIL', 'Philosophy of Mind' ),
  ( TRUE,  'CL', 'Computational Linguistics' ),
  ( TRUE,  'KI', 'Artificial Intelligence' ),
  ( TRUE,  'NI', 'Neuroinformatics' ),
  ( TRUE,  'NW', 'Neurobiology' ),
  -- MSC
  ( FALSE,  'CP', 'Cognitive Psychology' ),
  ( FALSE,  'PMC', 'Philosophy of Mind and Cognition' ),
  ( FALSE,  'LCL', 'Linguistics and Computational Linguistics' ),
  ( FALSE,  'AI', 'Artificial Intelligence' ),
  ( FALSE,  'NIR', 'Neuroinformatics and Robotics' ),
  ( FALSE,  'NS', 'Neuroscience' ),
  -- PHD
  ( FALSE,  'PHD', 'Doctorate Program' );


--
-- VALUES fields_in_regulations
--
INSERT INTO fields_in_regulations ( field_id, regulation_id, field_pm, field_wpm ) VALUES
  -- BSC11
  (  1, 1,    0,   33 ), -- open studies
  (  2, 1,    6,    0 ), -- logic
  (  3, 1,    8,    0 ), -- statistics
  (  4, 1,    9,    9 ), -- math
  (  5, 1,    9,    9 ), -- cs
  (  6, 1,    8,    8 ), -- psych
  (  7, 1,   10,    8 ), -- phil
  (  8, 1,    8,   12 ), -- lingu
  (  9, 1,    8,   12 ), -- ai
  ( 10, 1,   12,   12 ), -- neuroinfo
  ( 11, 1,    8,   12 ), -- neurobio
  -- MSC
  ( 12, 2, null,   16 ), -- neuropsycho
  ( 13, 2, null,   16 ), -- pom
  ( 14, 2, null,   16 ), -- lingu
  ( 15, 2, null,   16 ), -- ai
  ( 16, 2, null,   16 ), -- neuroinfo
  ( 17, 2, null,   16 ), -- neuroscience
  -- PHD
  ( 18, 3, null, null ),
  -- BSC00
  (  1, 4,    0,   44 ), -- open studies
  (  2, 4,    8,    0 ), -- logic
  (  3, 4,   12,    0 ), -- statistics
  (  4, 4,   12,   12 ), -- math
  (  5, 4,   12,   12 ), -- cs
  (  6, 4,    8,    8 ), -- psych
  (  7, 4,    8,    8 ), -- phil
  (  8, 4,   12,    8 ), -- lingu
  (  9, 4,    8,   12 ), -- ai
  ( 10, 4,   12,   12 ), -- neuroinfo
  ( 11, 4,    8,    8 ); -- neurobio
