-- MYSQL DATE FUCTIONS

-- 1 CURDATE:
SELECT EmployeeId, CURDATE() AS CurrentDate
FROM timesheetentry.gl_employee_m;

-- 2 NOW:
SELECT EmployeeId, NOW() AS CurrentDateTime
FROM timesheetentry.gl_employee_m;

-- 3 DATE_FORMAT:
SELECT EmployeeId, DATE_FORMAT(CreatedOn, '%d-%m-%y') AS FormattedDate
FROM timesheetentry.gl_employee_m;

-- 4 DATEDIFF:
SELECT EmployeeId, DATEDIFF(CURDATE(), CreatedOn) AS DateDifference  -- Returns the number of days between two date values.
FROM timesheetentry.gl_employee_m;

-- 5 DATE_ADD:
SELECT EmployeeId, DATE_ADD(CreatedOn, INTERVAL 3 MONTH) AS NewDate  -- Adds a time/date interval to a date and then returns the date.
FROM timesheetentry.gl_employee_m;

-- 6 DATE_SUB:
SELECT EmployeeId, DATE_SUB(CreatedOn, INTERVAL 1 WEEK) AS NewDate  -- Subtracts a time/date interval from a date and then returns the date.
FROM timesheetentry.gl_employee_m;

-- 7 EXTRACT:
SELECT EmployeeId, EXTRACT(MONTH FROM CreatedOn) AS ExtractedMonth  -- Extracts a part from a given date.
FROM timesheetentry.gl_employee_m;

-- 8 LAST_DAY:
SELECT EmployeeId, LAST_DAY(CreatedOn) AS LastDayOfMonth  -- Extracts the last day of the month for a given date.
FROM timesheetentry.gl_employee_m;

-- 9 MONTH:
SELECT EmployeeId, MONTH(CreatedOn) AS MonthOfYear  -- Returns the month part for a given date.
FROM timesheetentry.gl_employee_m;

-- 10 QUARTER:
SELECT EmployeeId, QUARTER(CreatedOn) AS QuarterOfYear  -- Returns the quarter of the year for a given date value.
FROM timesheetentry.gl_employee_m;

-- 11 YEAR:
SELECT EmployeeId, YEAR(CreatedOn) AS YearValue  -- Returns the year part for a given date.
FROM timesheetentry.gl_employee_m;

-- 12 WEEK:
SELECT EmployeeId, WEEK(CreatedOn) AS WeekNumber  -- Returns the week number for a given date.
FROM timesheetentry.gl_employee_m;

-- 13 ADDTIME
SELECT EmployeeId, ADDTIME(CreatedOn, '05:30:00') AS NewTime
FROM timesheetentry.gl_employee_m;

-- 14 CURRENT_TIME:
SELECT EmployeeId, CURRENT_TIME() AS CurrentTime
FROM timesheetentry.gl_employee_m;

-- 15 CURRENT_TIMESTAMP:
SELECT EmployeeId, CURRENT_TIMESTAMP() AS CurrentDateTime -- i think NOW and CURRENT_TIMESTAMP is same doubt???
FROM timesheetentry.gl_employee_m;

-- 16 DAYNAME:
SELECT EmployeeId, DAYNAME(CreatedOn) AS DayOfWeek
FROM timesheetentry.gl_employee_m;

-- 17 DAYOFMONTH:
SELECT EmployeeId, DAYOFMONTH(CreatedOn) AS DayOfMonth
FROM timesheetentry.gl_employee_m;

-- 18 FROM_DAYS:
SELECT EmployeeId, FROM_DAYS(737292) AS DateFromDays
FROM timesheetentry.gl_employee_m;

-- 19 HOUR:
SELECT EmployeeId, HOUR(CreatedOn) AS HourOfDay -- doubt??
FROM timesheetentry.gl_employee_m;

-- 20 LOCALTIME:
SELECT EmployeeId, LOCALTIME() AS Localtimetoday -- i think same as NOW doubt??
FROM timesheetentry.gl_employee_m;

-- 21 MAKEDATE:
SELECT EmployeeId, MAKEDATE(2023, 100) AS NewDate
FROM timesheetentry.gl_employee_m;

-- 22 MAKETIME:
SELECT EmployeeId, MAKETIME(12, 30, 45) AS NewTime
FROM timesheetentry.gl_employee_m;

-- 23 MICROSECOND:
SELECT EmployeeId, MICROSECOND(CreatedOn) AS MicrosecondPart
FROM timesheetentry.gl_employee_m;

-- 24 MINUTE:
SELECT EmployeeId, MINUTE(CreatedOn) AS MinuteOfHour
FROM timesheetentry.gl_employee_m;


-- 25 MONTHNAME:
SELECT EmployeeId, MONTHNAME(CreatedOn) AS MonthName
FROM timesheetentry.gl_employee_m;

-- 26 QUARTER:
SELECT EmployeeId, QUARTER(CreatedOn) AS QuarterOfYear
FROM timesheetentry.gl_employee_m;
