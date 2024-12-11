-- MYSQL NUMERIC FUNCTIONS

-- 1 ABS:
SELECT EmployeeId, ABS(MobileNo) AS AbsoluteMobileNo
FROM timesheetentry.gl_employee_m;

-- 2 AVG:
SELECT AVG(UserId) AS AverageUserId
FROM timesheetentry.gl_employee_m;

-- 3 CEIL / CEILING:
SELECT EmployeeId, CEIL('2.6') AS CeilMobileNo, CEILING(MobileNo) AS CeilingMobileNo
FROM timesheetentry.gl_employee_m;

-- 4 COUNT:
SELECT COUNT(EmployeeId) AS EmployeeCount
FROM timesheetentry.gl_employee_m;

-- 5 DEGREES:
SELECT EmployeeId, DEGREES(EmployeeID) AS DegreesPI -- 	Converts a value in radians to degrees
FROM timesheetentry.gl_employee_m;

-- 6 DIV:
SELECT EmployeeId, EmployeeId DIV 2 AS EmployeeIdDividedBy2
FROM timesheetentry.gl_employee_m;

-- 7 EXP:
SELECT EmployeeId, EXP(EmployeeId) AS ExponentialValue  -- 	Returns e raised to the power of a specified number
FROM timesheetentry.gl_employee_m;

-- 8 FLOOR:
SELECT EmployeeId, FLOOR(EmployeeId) AS FloorEmployeeId ,FLOOR('3.1') AS FloorMobileNo
FROM timesheetentry.gl_employee_m;

-- 9 GREATEST:
SELECT EmployeeId, GREATEST(EmployeeId, MobileNo) AS GreatestValue
FROM timesheetentry.gl_employee_m;

-- 10 LEAST:
SELECT EmployeeId, LEAST(UserId, MobileNo) AS LeastValue
FROM timesheetentry.gl_employee_m;

-- 11 MAX:
SELECT MAX(UserId) AS MaxUserId
FROM timesheetentry.gl_employee_m;

-- 12 MIN:
SELECT MIN(UserId) AS MinUserId
FROM timesheetentry.gl_employee_m;

-- 13 MOD:
SELECT EmployeeId, MOD(EmployeeId, 2) AS ModuloValue -- doubt???
FROM timesheetentry.gl_employee_m;

-- 14 POW / POWER:
SELECT EmployeeId, POW(EmployeeId, 2) AS PowerValue, POWER(UserId, 2) AS PowerValueAlt
FROM timesheetentry.gl_employee_m;

-- 15 RADIANS:
SELECT EmployeeId, RADIANS(EmployeeId) AS RadiansValue  -- 	Converts a degree value into radians
FROM timesheetentry.gl_employee_m;

-- 16 RAND:
SELECT RAND() AS RandomValue  -- Returns a random number ??doubt??
FROM timesheetentry.gl_employee_m;

-- 17 ROUND:
SELECT EmployeeId, ROUND(EmployeeId / 2, 9) AS RoundedValue
FROM timesheetentry.gl_employee_m;

-- 18 SQRT:
SELECT EmployeeId, SQRT(EmployeeId) AS SquareRootValue
FROM timesheetentry.gl_employee_m;

-- 19 SUM:
SELECT SUM(UserId) AS TotalUserId
FROM timesheetentry.gl_employee_m;

-- 20 TRUNCATE:
SELECT EmployeeId, TRUNCATE(EmployeeId / 2, 9) AS TruncatedValue  -- truncate and round of same work doubt???
FROM timesheetentry.gl_employee_m;  -- 	Truncates a number to the specified number of decimal places

