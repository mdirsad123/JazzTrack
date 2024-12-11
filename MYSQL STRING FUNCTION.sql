-- Mysql String Function-- 

-- 1 ASCII:
SELECT ASCII('C') AS AsciiValue;   -- doubt???

-- 2 CHAR_LENGTH / CHARACTER_LENGTH:
SELECT EmployeeName, CHAR_LENGTH(EmployeeName) AS CharacterLength, CHARACTER_LENGTH(EmployeeName) AS CharacterLengthAlt
FROM timesheetentry.gl_employee_m;

-- 3 CONCAT:
SELECT CONCAT(EmployeeName, ' - ', Gender) AS Concatenated
FROM timesheetentry.gl_employee_m;

-- 4 CONCAT_WS:
SELECT CONCAT_WS(', ', EmployeeName, Gender, Status) AS ConcatenatedWithSeparator
FROM timesheetentry.gl_employee_m;

-- 5 FIELD:
SELECT EmployeeName, FIELD(EmployeeName, 'irsad', 'sandhi' ,'arun') AS FieldPosition
FROM timesheetentry.gl_employee_m;

-- 6 FIND_IN_SET:
SELECT EmployeeName, FIND_IN_SET('arun', EmployeeName) AS FoundInSet
FROM timesheetentry.gl_employee_m;

-- 7 FORMAT:
SELECT FORMAT(MobileNo, 2) AS FormattedMobileNo
FROM timesheetentry.gl_employee_m;

-- 8 INSERT:
SELECT INSERT(EmployeeName, 1, 0, 'MD-') AS InsertedString  -- means first(1) parameter is insert start index and second(3) index insert start from index 3 to last
FROM timesheetentry.gl_employee_m;

-- 9 INSTR:
SELECT EmployeeName, INSTR(EmployeeName, 'sandhi') AS InStringPosition
FROM timesheetentry.gl_employee_m;

-- 10 LCASE / LOWER:
SELECT EmployeeName, LCASE(EmployeeName) AS Lowercase, LOWER(EmployeeName) AS LowercaseAlt
FROM timesheetentry.gl_employee_m;

-- 11 UCASE / UPPER:
SELECT EmployeeName, UCASE(EmployeeName) AS Uppercase, UPPER(EmployeeName) AS UppercaseAlt
FROM timesheetentry.gl_employee_m;

-- 12 LEFT:
SELECT EmployeeName, LEFT(EmployeeName, 3) AS LeftSubstring
FROM timesheetentry.gl_employee_m;

-- 13 RIGHT:
SELECT EmployeeName, RIGHT(EmployeeName, 3) AS RightSubstring
FROM timesheetentry.gl_employee_m;

-- 14 LENGTH:
SELECT EmployeeName, LENGTH(EmployeeName) AS LengthInBytes
FROM timesheetentry.gl_employee_m;

-- 15 LOCATE:
SELECT EmployeeName, LOCATE('arun', EmployeeName) AS Location
FROM timesheetentry.gl_employee_m;

-- 16 LOWER:
SELECT EmployeeName, LOWER(EmployeeName) as LowerCase
FROM timesheetentry.gl_employee_m;

-- 17 LPAD / RPAD:
SELECT LPAD(EmployeeName, 9, '*') AS LeftPaddedString
FROM timesheetentry.gl_employee_m;

-- 18 LTRIM:
SELECT EmployeeName, LTRIM(EmployeeName) as TrimmedName
FROM timesheetentry.gl_employee_m;

-- 19 MID / SUBSTRING:
SELECT EmployeeName, MID(EmployeeName, 2, 1) AS Substring
FROM timesheetentry.gl_employee_m;

-- 20 POSITION:
SELECT EmployeeName, POSITION('arun' IN EmployeeName) AS Position  -- doubt????
FROM timesheetentry.gl_employee_m;

-- 21 REPLACE:
SELECT EmployeeName, REPLACE(EmployeeName, 'arun', 'John') AS ReplacedString
FROM timesheetentry.gl_employee_m;

-- 22 REVERSE:
SELECT EmployeeName, REVERSE(EmployeeName) AS ReversedString
FROM timesheetentry.gl_employee_m;

-- 23 RPAD:
SELECT RPAD(EmployeeName, 10, "*") as PaddingName
FROM timesheetentry.gl_employee_m;

-- 24 RTRIM:
SELECT EmployeeName, RTRIM(EmployeeName) as RTRIMName
FROM timesheetentry.gl_employee_m;

-- 25 SPACE:
SELECT EmployeeName, SPACE(5) AS SpaceString  -- doubt????
FROM timesheetentry.gl_employee_m;

-- 26 STRCMP:
SELECT EmployeeName, STRCMP(EmployeeName, 'arun') AS StringComparison -- doubt????
FROM timesheetentry.gl_employee_m;

-- 27 SUBSTR / SUBSTRING:
SELECT EmployeeName, SUBSTR(EmployeeName, 3, 3) AS Substring
FROM timesheetentry.gl_employee_m;

-- 28 SUBSTRING_INDEX:
SELECT SUBSTRING_INDEX(EmployeeName, ' ', 2) AS SubstringResult 
FROM timesheetentry.gl_employee_m;

-- 29 TRIM:
SELECT TRIM(EmployeeName) as TrimmedName
FROM timesheetentry.gl_employee_m;


-- 30 REPEAT
SELECT repeat(EmployeeName, 2) AS RepeatedString
FROM timesheetentry.gl_employee_m;
