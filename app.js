// Employee Management System — front-end demo
// Mirrors the Oracle tables in /sql (DEPARTMENTS, EMPLOYEES). Data is kept in localStorage.

const STORE_KEY = 'ems-data-v1';
const DEPARTMENTS = ['Engineering', 'Finance', 'Human Resources', 'Operations', 'Sales'];

const SEED = [
  { first: 'Ayesha', last: 'Khan', dept: 'Engineering', job: 'Software Engineer', hireDate: '2023-02-14', salary: 185000, status: 'Active' },
  { first: 'Bilal', last: 'Ahmed', dept: 'Finance', job: 'Accountant', hireDate: '2021-07-01', salary: 140000, status: 'Active' },
  { first: 'Sana', last: 'Malik', dept: 'Human Resources', job: 'HR Officer', hireDate: '2022-11-20', salary: 120000, status: 'On leave' },
  { first: 'Hamza', last: 'Iqbal', dept: 'Engineering', job: 'Database Developer', hireDate: '2024-03-04', salary: 175000, status: 'Active' },
  { first: 'Fatima', last: 'Raza', dept: 'Sales', job: 'Sales Executive', hireDate: '2020-09-15', salary: 110000, status: 'Active' },
  { first: 'Usman', last: 'Tariq', dept: 'Operations', job: 'Operations Lead', hireDate: '2019-05-27', salary: 210000, status: 'Active' },
  { first: 'Zainab', last: 'Hussain', dept: 'Engineering', job: 'QA Analyst', hireDate: '2024-08-12', salary: 130000, status: 'Active' },
  { first: 'Ali', last: 'Shah', dept: 'Sales', job: 'Account Manager', hireDate: '2022-01-10', salary: 155000, status: 'Terminated' },
  { first: 'Hira', last: 'Butt', dept: 'Finance', job: 'Financial Analyst', hireDate: '2023-06-19', salary: 160000, status: 'Active' },
  { first: 'Omar', last: 'Farooq', dept: 'Operations', job: 'Logistics Coordinator', hireDate: '2025-01-06', salary: 105000, status: 'Active' },
].map((e, i) => ({ id: i + 1, email: `${e.first}.${e.last}@company.pk`.toLowerCase(), ...e }));

const $ = (s) => document.querySelector(s);
const fmt = new Intl.NumberFormat('en-PK');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let employees = load();
let sort = { key: 'name', dir: 1 };

function load() {
  try { const d = JSON.parse(localStorage.getItem(STORE_KEY)); if (Array.isArray(d)) return d; } catch { /* ignore */ }
  return structuredClone(SEED);
}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(employees)); } catch { /* ignore */ } }

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('show'), 2000);
}

const statusBadge = (s) => `<span class="badge ${s === 'Active' ? 'b-green' : s === 'On leave' ? 'b-amber' : 'b-red'}">${esc(s)}</span>`;

function renderKpis() {
  const active = employees.filter((e) => e.status === 'Active');
  const payroll = active.reduce((sum, e) => sum + Number(e.salary), 0);
  const avg = active.length ? Math.round(payroll / active.length) : 0;
  const thisYear = new Date().getFullYear();
  const newHires = employees.filter((e) => new Date(e.hireDate).getFullYear() === thisYear).length;
  $('#kpis').innerHTML = [
    ['Total employees', employees.length, `${active.length} active`],
    ['Departments', new Set(employees.map((e) => e.dept)).size, 'with staff'],
    ['Monthly payroll', `₨ ${fmt.format(payroll)}`, 'active employees'],
    ['Average salary', `₨ ${fmt.format(avg)}`, `${newHires} hired this year`],
  ].map(([l, v, s]) => `<div class="kpi"><span>${l}</span><strong>${v}</strong><em>${s}</em></div>`).join('');
}

function renderCharts() {
  const counts = DEPARTMENTS.map((d) => [d, employees.filter((e) => e.dept === d && e.status !== 'Terminated').length]);
  const max = Math.max(1, ...counts.map((c) => c[1]));
  $('#deptBars').innerHTML = counts.map(([d, n]) =>
    `<div class="bar-row"><span>${d}</span><div class="progress"><span style="width:${(n / max) * 100}%"></span></div><b>${n}</b></div>`).join('');

  const recent = [...employees].sort((a, b) => b.hireDate.localeCompare(a.hireDate)).slice(0, 4);
  $('#recent').innerHTML = recent.map((e) =>
    `<div><div class="cell-main">${esc(e.first)} ${esc(e.last)}</div><div class="cell-sub">${esc(e.job)} · ${e.hireDate}</div></div>`).join('');
}

function filtered() {
  const q = $('#search').value.trim().toLowerCase();
  const dept = $('#deptFilter').value;
  const status = $('#statusFilter').value;
  return employees
    .filter((e) => (!dept || e.dept === dept) && (!status || e.status === status))
    .filter((e) => !q || `${e.first} ${e.last} ${e.email} ${e.job}`.toLowerCase().includes(q))
    .sort((a, b) => {
      const va = sort.key === 'name' ? `${a.first} ${a.last}` : a[sort.key];
      const vb = sort.key === 'name' ? `${b.first} ${b.last}` : b[sort.key];
      return (typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))) * sort.dir;
    });
}

function renderTable() {
  const list = filtered();
  $('#count').textContent = list.length;
  $('#rows').innerHTML = list.length ? list.map((e) => `
    <tr>
      <td><div class="cell-main">${esc(e.first)} ${esc(e.last)}</div><div class="cell-sub">${esc(e.email)}</div></td>
      <td>${esc(e.dept)}</td>
      <td>${esc(e.job)}</td>
      <td>${e.hireDate}</td>
      <td>${fmt.format(e.salary)}</td>
      <td>${statusBadge(e.status)}</td>
      <td><div class="actions">
        <button class="btn btn-sm" data-edit="${e.id}">Edit</button>
        <button class="btn btn-sm" data-raise="${e.id}" title="Give a 10% raise">+10%</button>
        <button class="btn btn-sm btn-danger" data-del="${e.id}">Delete</button>
      </div></td>
    </tr>`).join('') : '<tr><td colspan="7" class="empty">No employees match your filters.</td></tr>';
  document.querySelectorAll('th[data-sort]').forEach((th) => {
    th.classList.toggle('asc', th.dataset.sort === sort.key && sort.dir === 1);
    th.classList.toggle('desc', th.dataset.sort === sort.key && sort.dir === -1);
  });
}

function render() { renderKpis(); renderCharts(); renderTable(); }

// ---------- Modal / form ----------
const modal = $('#modal');
const form = $('#form');

function openForm(emp) {
  form.reset();
  $('#modalTitle').textContent = emp ? 'Edit employee' : 'Add employee';
  const data = emp || { hireDate: new Date().toISOString().slice(0, 10), status: 'Active' };
  for (const [k, v] of Object.entries(data)) if (form.elements[k]) form.elements[k].value = v;
  if (!emp) form.elements.id.value = '';
  modal.classList.add('open');
  form.elements.first.focus();
}
function closeForm() { modal.classList.remove('open'); }

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  d.salary = Number(d.salary);
  const email = d.email.trim().toLowerCase();
  if (employees.some((e) => e.email === email && String(e.id) !== d.id)) { toast('That email is already in use'); return; }
  d.email = email;
  if (d.id) {
    const i = employees.findIndex((e) => String(e.id) === d.id);
    employees[i] = { ...employees[i], ...d, id: employees[i].id };
    toast('Employee updated');
  } else {
    employees.push({ ...d, id: Math.max(0, ...employees.map((e) => e.id)) + 1 });
    toast('Employee added');
  }
  save(); closeForm(); render();
});

modal.addEventListener('click', (ev) => { if (ev.target === modal || ev.target.hasAttribute('data-close')) closeForm(); });
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeForm(); });

$('#rows').addEventListener('click', (ev) => {
  const b = ev.target.closest('button'); if (!b) return;
  const id = Number(b.dataset.edit || b.dataset.del || b.dataset.raise);
  const emp = employees.find((e) => e.id === id);
  if (b.dataset.edit) openForm(emp);
  if (b.dataset.raise) { emp.salary = Math.round(emp.salary * 1.1); save(); render(); toast(`${emp.first} received a 10% raise`); }
  if (b.dataset.del && confirm(`Delete ${emp.first} ${emp.last}?`)) { employees = employees.filter((e) => e.id !== id); save(); render(); toast('Employee deleted'); }
});

document.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
  sort = { key: th.dataset.sort, dir: sort.key === th.dataset.sort ? -sort.dir : 1 };
  renderTable();
}));

['#search', '#deptFilter', '#statusFilter'].forEach((s) => $(s).addEventListener('input', renderTable));
$('#addBtn').addEventListener('click', () => openForm());
$('#resetBtn').addEventListener('click', () => { employees = structuredClone(SEED); save(); render(); toast('Demo data restored'); });

$('#exportBtn').addEventListener('click', () => {
  const head = ['EMPLOYEE_ID', 'FIRST_NAME', 'LAST_NAME', 'EMAIL', 'DEPARTMENT', 'JOB_TITLE', 'HIRE_DATE', 'SALARY', 'STATUS'];
  const lines = filtered().map((e) => [e.id, e.first, e.last, e.email, e.dept, e.job, e.hireDate, e.salary, e.status]
    .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'employees.csv' });
  a.click(); URL.revokeObjectURL(a.href);
});

// Populate department selects
const opts = DEPARTMENTS.map((d) => `<option>${d}</option>`).join('');
$('#deptFilter').insertAdjacentHTML('beforeend', opts);
form.elements.dept.innerHTML = opts;

render();
