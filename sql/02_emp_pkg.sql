-- =============================================================
-- EMS_EMP_PKG — business logic for the Employee Management System
-- Called from Oracle APEX page processes, e.g.
--   ems_emp_pkg.give_raise(p_employee_id => :P3_EMPLOYEE_ID, p_percent => :P3_PERCENT);
-- =============================================================

CREATE OR REPLACE PACKAGE ems_emp_pkg AS

  FUNCTION add_employee (
    p_first_name    IN ems_employees.first_name%TYPE,
    p_last_name     IN ems_employees.last_name%TYPE,
    p_email         IN ems_employees.email%TYPE,
    p_department_id IN ems_employees.department_id%TYPE,
    p_job_title     IN ems_employees.job_title%TYPE,
    p_salary        IN ems_employees.salary%TYPE,
    p_hire_date     IN ems_employees.hire_date%TYPE DEFAULT TRUNC(SYSDATE),
    p_manager_id    IN ems_employees.manager_id%TYPE DEFAULT NULL
  ) RETURN ems_employees.employee_id%TYPE;

  PROCEDURE give_raise (
    p_employee_id IN ems_employees.employee_id%TYPE,
    p_percent     IN NUMBER
  );

  PROCEDURE transfer_employee (
    p_employee_id   IN ems_employees.employee_id%TYPE,
    p_department_id IN ems_employees.department_id%TYPE
  );

  PROCEDURE terminate_employee (
    p_employee_id IN ems_employees.employee_id%TYPE
  );

  FUNCTION department_payroll (
    p_department_id IN ems_departments.department_id%TYPE
  ) RETURN NUMBER;

END ems_emp_pkg;
/

CREATE OR REPLACE PACKAGE BODY ems_emp_pkg AS

  PROCEDURE assert_exists (p_employee_id IN NUMBER) IS
    l_count PLS_INTEGER;
  BEGIN
    SELECT COUNT(*) INTO l_count FROM ems_employees WHERE employee_id = p_employee_id;
    IF l_count = 0 THEN
      RAISE_APPLICATION_ERROR(-20001, 'Employee ' || p_employee_id || ' does not exist.');
    END IF;
  END assert_exists;

  FUNCTION add_employee (
    p_first_name    IN ems_employees.first_name%TYPE,
    p_last_name     IN ems_employees.last_name%TYPE,
    p_email         IN ems_employees.email%TYPE,
    p_department_id IN ems_employees.department_id%TYPE,
    p_job_title     IN ems_employees.job_title%TYPE,
    p_salary        IN ems_employees.salary%TYPE,
    p_hire_date     IN ems_employees.hire_date%TYPE DEFAULT TRUNC(SYSDATE),
    p_manager_id    IN ems_employees.manager_id%TYPE DEFAULT NULL
  ) RETURN ems_employees.employee_id%TYPE IS
    l_id ems_employees.employee_id%TYPE;
  BEGIN
    IF p_salary < 0 THEN
      RAISE_APPLICATION_ERROR(-20002, 'Salary cannot be negative.');
    END IF;

    INSERT INTO ems_employees (first_name, last_name, email, department_id,
                               job_title, salary, hire_date, manager_id)
    VALUES (INITCAP(p_first_name), INITCAP(p_last_name), p_email, p_department_id,
            p_job_title, p_salary, p_hire_date, p_manager_id)
    RETURNING employee_id INTO l_id;

    RETURN l_id;
  EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
      RAISE_APPLICATION_ERROR(-20003, 'An employee with email ' || p_email || ' already exists.');
  END add_employee;

  PROCEDURE give_raise (
    p_employee_id IN ems_employees.employee_id%TYPE,
    p_percent     IN NUMBER
  ) IS
  BEGIN
    IF p_percent NOT BETWEEN 0 AND 50 THEN
      RAISE_APPLICATION_ERROR(-20004, 'Raise must be between 0 and 50 percent.');
    END IF;
    assert_exists(p_employee_id);

    UPDATE ems_employees
       SET salary = ROUND(salary * (1 + p_percent / 100), -2)
     WHERE employee_id = p_employee_id
       AND status <> 'Terminated';
  END give_raise;

  PROCEDURE transfer_employee (
    p_employee_id   IN ems_employees.employee_id%TYPE,
    p_department_id IN ems_employees.department_id%TYPE
  ) IS
  BEGIN
    assert_exists(p_employee_id);
    UPDATE ems_employees
       SET department_id = p_department_id,
           manager_id    = NULL
     WHERE employee_id = p_employee_id;
  END transfer_employee;

  PROCEDURE terminate_employee (
    p_employee_id IN ems_employees.employee_id%TYPE
  ) IS
  BEGIN
    assert_exists(p_employee_id);
    -- Reports of a leaving manager are left without a manager until reassigned
    UPDATE ems_employees SET manager_id = NULL WHERE manager_id = p_employee_id;
    UPDATE ems_employees SET status = 'Terminated' WHERE employee_id = p_employee_id;
  END terminate_employee;

  FUNCTION department_payroll (
    p_department_id IN ems_departments.department_id%TYPE
  ) RETURN NUMBER IS
    l_total NUMBER;
  BEGIN
    SELECT NVL(SUM(salary), 0)
      INTO l_total
      FROM ems_employees
     WHERE department_id = p_department_id
       AND status = 'Active';
    RETURN l_total;
  END department_payroll;

END ems_emp_pkg;
/
