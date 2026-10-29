# Employee Management System

A small HR application for managing employee records, departments and salaries.
It has two parts:

- **Database (`/sql`)** — Oracle tables, constraints, triggers, a reporting view and a PL/SQL package with the business rules. This is the backend you would build an Oracle APEX application on.
- **Web demo (root folder)** — a working front end in plain HTML, CSS and JavaScript that mirrors the same data model, so the app can be tried in any browser.

## Features

- Dashboard cards: headcount, departments, monthly payroll, average salary
- Headcount-by-department chart and recent hires
- Searchable, sortable employee table with department and status filters
- Add, edit and delete employees with validation (unique email, required fields)
- One-click 10% salary raise (matches `ems_emp_pkg.give_raise`)
- Export the filtered list to CSV
- Data saved in the browser (localStorage), with a "Reset demo data" button

## Run the web demo

No install needed — open `index.html` in a browser.
Or, from VS Code, use the **Live Server** extension and click "Go Live".

## Set up the database (Oracle / Oracle APEX)

Run the scripts in order (APEX: *SQL Workshop → SQL Scripts*):

| Script | What it creates |
| --- | --- |
| `sql/01_schema.sql` | `EMS_DEPARTMENTS`, `EMS_EMPLOYEES`, `EMS_SALARY_HISTORY`, triggers, `EMS_EMPLOYEE_V` view |
| `sql/02_emp_pkg.sql` | `EMS_EMP_PKG` — add employee, give raise, transfer, terminate, department payroll |
| `sql/03_sample_data.sql` | Sample departments and employees, plus example report queries |

### Suggested APEX pages

1. **Dashboard** — cards and a bar chart using the "headcount and payroll by department" query
2. **Employees** — interactive report on `EMS_EMPLOYEE_V`
3. **Employee form** — form on `EMS_EMPLOYEES`; a page process calls `ems_emp_pkg.give_raise`
4. **Departments** — interactive grid on `EMS_DEPARTMENTS`

## Tech

Oracle SQL · PL/SQL · HTML · CSS · JavaScript

---

Built by [Muhammad Usman](https://github.com/musmantech8) — Oracle APEX Developer.
