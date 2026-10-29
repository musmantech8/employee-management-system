-- =============================================================
-- Sample data + example report queries
-- =============================================================

INSERT INTO ems_departments (department_name, location) VALUES ('Engineering', 'Lahore');
INSERT INTO ems_departments (department_name, location) VALUES ('Finance', 'Karachi');
INSERT INTO ems_departments (department_name, location) VALUES ('Human Resources', 'Islamabad');
INSERT INTO ems_departments (department_name, location) VALUES ('Operations', 'Lahore');
INSERT INTO ems_departments (department_name, location) VALUES ('Sales', 'Karachi');

DECLARE
  FUNCTION dept (p_name VARCHAR2) RETURN NUMBER IS
    l_id NUMBER;
  BEGIN
    SELECT department_id INTO l_id FROM ems_departments WHERE department_name = p_name;
    RETURN l_id;
  END;

  PROCEDURE add_emp (p_first VARCHAR2, p_last VARCHAR2, p_dept VARCHAR2, p_job VARCHAR2,
                     p_hired VARCHAR2, p_salary NUMBER) IS
    l_id NUMBER;
  BEGIN
    l_id := ems_emp_pkg.add_employee(
      p_first_name    => p_first,
      p_last_name     => p_last,
      p_email         => LOWER(p_first || '.' || p_last || '@company.pk'),
      p_department_id => dept(p_dept),
      p_job_title     => p_job,
      p_salary        => p_salary,
      p_hire_date     => TO_DATE(p_hired, 'YYYY-MM-DD'));
  END;
BEGIN
  add_emp('Usman',  'Tariq',   'Operations',      'Operations Lead',       '2019-05-27', 210000);
  add_emp('Ayesha', 'Khan',    'Engineering',     'Software Engineer',     '2023-02-14', 185000);
  add_emp('Bilal',  'Ahmed',   'Finance',         'Accountant',            '2021-07-01', 140000);
  add_emp('Sana',   'Malik',   'Human Resources', 'HR Officer',            '2022-11-20', 120000);
  add_emp('Hamza',  'Iqbal',   'Engineering',     'Database Developer',    '2024-03-04', 175000);
  add_emp('Fatima', 'Raza',    'Sales',           'Sales Executive',       '2020-09-15', 110000);
  add_emp('Zainab', 'Hussain', 'Engineering',     'QA Analyst',            '2024-08-12', 130000);
  add_emp('Ali',    'Shah',    'Sales',           'Account Manager',       '2022-01-10', 155000);
  add_emp('Hira',   'Butt',    'Finance',         'Financial Analyst',     '2023-06-19', 160000);
  add_emp('Omar',   'Farooq',  'Operations',      'Logistics Coordinator', '2025-01-06', 105000);
END;
/

UPDATE ems_employees SET status = 'On leave' WHERE email = 'sana.malik@company.pk';
DECLARE
  l_id ems_employees.employee_id%TYPE;
BEGIN
  SELECT employee_id INTO l_id FROM ems_employees WHERE email = 'ali.shah@company.pk';
  ems_emp_pkg.terminate_employee(l_id);
END;
/
COMMIT;

-- -------------------------------------------------------------
-- Example reports (use as APEX chart / interactive report sources)
-- -------------------------------------------------------------

-- Headcount and payroll by department
SELECT d.department_name,
       COUNT(e.employee_id)                                    AS headcount,
       SUM(CASE WHEN e.status = 'Active' THEN e.salary END)    AS monthly_payroll,
       ROUND(AVG(CASE WHEN e.status = 'Active' THEN e.salary END)) AS avg_salary
  FROM ems_departments d
  LEFT JOIN ems_employees e ON e.department_id = d.department_id AND e.status <> 'Terminated'
 GROUP BY d.department_name
 ORDER BY headcount DESC;

-- Top earner in each department (analytic function)
SELECT department_name, full_name, salary
  FROM (SELECT v.*, RANK() OVER (PARTITION BY department_name ORDER BY salary DESC) AS rnk
          FROM ems_employee_v v
         WHERE status = 'Active')
 WHERE rnk = 1;

-- Hires per year
SELECT EXTRACT(YEAR FROM hire_date) AS hire_year, COUNT(*) AS hires
  FROM ems_employees
 GROUP BY EXTRACT(YEAR FROM hire_date)
 ORDER BY hire_year;
