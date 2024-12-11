-- MYSQL ADVANCE FUNCTION

-- 1 CASE:
SELECT EmployeeId, 
       CASE 
          WHEN Status = 'PASS' THEN 'Active'   -- Goes through conditions and returns a value when the first condition is met.
          WHEN Status = 'fail' THEN 'Failed' 
          ELSE 'Unknown' 
       END AS StatusCategory
FROM timesheetentry.gl_employee_m;

-- 2 COALESCE:
SELECT EmployeeId, COALESCE(MobileNo, 'Not Available') AS ContactNumber  -- Returns the first non-null value in a list.
FROM timesheetentry.gl_employee_m;

-- 3 IFNULL:
SELECT EmployeeId, IFNULL(EmailId, 'No Email') AS Email
FROM timesheetentry.gl_employee_m;

-- 4 ISNULL
SELECT ISNULL(EMployeeName)
FROM timesheetentry.gl_employee_m;

-- 5 LAST_INSERT_ID:
INSERT INTO timesheetentry.gl_employee_m (EmployeeName) VALUES ('John Doe');  -- Returns the AUTO_INCREMENT id of the last row that has been inserted or updated in a table.
SELECT LAST_INSERT_ID() AS LastInsertedId;

-- 6 NULLIF:
SELECT EmployeeId, NULLIF(ModifiedBy, CreatedBy) AS ModifiedByDiffers  -- Compares two expressions and returns NULL if they are equal; otherwise, returns the first expression.
FROM timesheetentry.gl_employee_m;

-- 7 USER:
SELECT USER() AS CurrentUser;  -- Returns the current MySQL user name and host name.

-- 8 VERSION:
SELECT VERSION() AS MySQLVersion;

-- 9 DATABASE:
SELECT DATABASE() AS CurrentDatabase;

-- 10 CONNECTION_ID:
SELECT CONNECTION_ID() AS ConnectionID; -- doubt??

-- 11 LAST_INSERT_ID:
INSERT INTO timesheetentry.gl_employee_m (EmployeeName) VALUES ('John Doe');
SELECT LAST_INSERT_ID() AS LastInsertedId;
