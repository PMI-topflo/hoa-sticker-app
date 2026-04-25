-- Add Sunbiz / public-records fields to the associations table
ALTER TABLE associations
  ADD COLUMN IF NOT EXISTS principal_address     text,
  ADD COLUMN IF NOT EXISTS city                  text,
  ADD COLUMN IF NOT EXISTS state                 text,
  ADD COLUMN IF NOT EXISTS zip                   text,
  ADD COLUMN IF NOT EXISTS sunbiz_document_number text,
  ADD COLUMN IF NOT EXISTS fei_ein_number        text,
  ADD COLUMN IF NOT EXISTS sunbiz_status         text,
  ADD COLUMN IF NOT EXISTS date_filed            text;

-- Populate from Florida Sunbiz public records (sourced 2026-04-25)
UPDATE associations SET
  principal_address      = v.principal_address,
  city                   = v.city,
  state                  = v.state,
  zip                    = v.zip,
  sunbiz_document_number = v.doc,
  fei_ein_number         = v.ein,
  sunbiz_status          = v.status,
  date_filed             = v.filed
FROM (VALUES
  ('ABBOTT', '7636 Abbott Avenue',                         'Miami Beach',        'FL', '33141', 'N05000003186', '80-0458638', 'ACTIVE', '03/28/2005'),
  ('BHB',    '5638-5710 Santiago Circle',                  'Boca Raton',         'FL', '33433', 'N21560',       '65-0040417', 'ACTIVE', '07/14/1987'),
  ('CHV',    '1041 NW 45 ST',                              'Deerfield Beach',    'FL', '33064', '728548',       '59-1566577', 'ACTIVE', '12/26/1973'),
  ('DELA',   '20481 NE 34th Court',                        'Aventura',           'FL', '33180', '738270',       '59-2071375', 'ACTIVE', '03/10/1977'),
  ('ESSI',   '7901 NW 67 Street',                          'Miami',              'FL', '33166', 'N05765',       '59-2728655', 'ACTIVE', '10/19/1984'),
  ('FIFTH',  '6750 Arbor Drive',                           'Miramar',            'FL', '33023', '712080',       '59-1202373', 'ACTIVE', '01/12/1967'),
  ('GK7',    '1031 Ives Dairy Road Suite 228',             'Miami',              'FL', '33179', 'N05000005390', '51-0544048', 'ACTIVE', '05/23/2005'),
  ('GVH',    '1245 Northeast 18th Avenue',                 'Fort Lauderdale',    'FL', '33304', 'N21000009068', '87-2133202', 'ACTIVE', '06/29/2021'),
  ('ISLAND', '1140 102nd Street',                          'Bay Harbor Islands', 'FL', '33154', 'N06000006741', '59-1881798', 'ACTIVE', '06/23/2006'),
  ('KANE',   '1140 Kane Concourse, 4th Floor',             'Bay Harbor Islands', 'FL', '33154', '755786',       '59-2242333', 'ACTIVE', '01/07/1981'),
  ('KGA',    '2240 Van Buren St',                          'Hollywood',          'FL', '33020', '744321',       '59-1972400', 'ACTIVE', '09/20/1978'),
  ('LCLUB',  '20860 San Simeon Way',                       'Miami',              'FL', '33179', '767964',       '59-2321655', 'ACTIVE', '04/14/1983'),
  ('LFA',    '2866 NE 30 ST',                              'Fort Lauderdale',    'FL', '33306', '702516',       '59-0999437', 'ACTIVE', '01/01/1962'),
  ('MACO',   '13117 NW 107 Ave',                           'Hialeah Gardens',    'FL', '33018', 'N01000008260', '01-0575402', 'ACTIVE', '11/26/2001'),
  ('MANXI',  '1031 Ives Dairy Road Bldg 4 Suite 228',      'Miami',              'FL', '33179', '730764',       '52-1042715', 'ACTIVE', '09/23/1974'),
  ('ONE',    '1150 101 Street',                            'Bay Harbor Islands', 'FL', '33154', 'N18000012569', '83-2689944', 'ACTIVE', '11/27/2018'),
  ('PVV',    '1031 Ives Dairy Road Bldg 4 Suite 228',      'Miami',              'FL', '33179', 'N17000009570', '82-3148908', 'ACTIVE', '09/22/2017'),
  ('SHORE',  '3501-3561 NE 171 ST',                        'North Miami Beach',  'FL', '33160', '740466',       '59-2077007', 'ACTIVE', '10/18/1977'),
  ('SP',     '1501 NW 45TH ST #C',                         'Deerfield Beach',    'FL', '33064', 'N33355',       '65-0136095', 'ACTIVE', '07/21/1989'),
  ('VPC5',   '801 NE 25th Ave',                            'Hallandale Beach',   'FL', '33009', '741346',       '59-1815615', 'ACTIVE', '01/13/1978'),
  ('VPCI',   '801 NE 25th Ave',                            'Hallandale Beach',   'FL', '33009', '734842',       '59-1769384', 'ACTIVE', '01/23/1976'),
  ('VPCII',  '801 NE 25th Ave',                            'Hallandale Beach',   'FL', '33009', '737198',       '59-1769410', 'ACTIVE', '11/02/1976'),
  ('VPREC',  '801 NE 25th Avenue',                         'Hallandale',         'FL', '33009', '734843',       '59-1769383', 'ACTIVE', '01/23/1976'),
  ('WBP',    '1031 Ives Dairy Road Bldg 4 Suite 228',      'Miami',              'FL', '33179', 'N07000000732', '20-8630034', 'ACTIVE', '01/22/2007'),
  ('WBPA',   '430/470 Ansin Blvd',                         'Hallandale Beach',   'FL', '33009', 'N05000004150', '20-2744631', 'ACTIVE', '04/21/2005')
) AS v(code, principal_address, city, state, zip, doc, ein, status, filed)
WHERE associations.association_code = v.code;
