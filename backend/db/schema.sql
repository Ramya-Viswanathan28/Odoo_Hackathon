-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- DROP tables if they exist to allow clean reseeding
DROP TABLE IF EXISTS simulation_results;
DROP TABLE IF EXISTS workload;
DROP TABLE IF EXISTS workforce_risk;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS employee_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS task_dependencies;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

-- 1. Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('employee', 'hr')) NOT NULL,
  is_verified INTEGER DEFAULT 0,
  verification_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments table
CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  manager_id INTEGER
);

-- 3. Employees table
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department_id INTEGER,
  job_title TEXT NOT NULL,
  hire_date DATE NOT NULL,
  status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
  current_workload INTEGER DEFAULT 0,
  avatar_url TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Circular FK link for departments manager - set after employees table creation
-- In SQLite, we can define the foreign key on departments, but since departments is created first, we reference employees(id).
-- sqlite allows referencing tables that don't exist yet, or we can just define it.

-- 4. Attendance table
CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  date DATE NOT NULL,
  check_in_time TEXT,
  check_out_time TEXT,
  status TEXT CHECK(status IN ('present', 'absent', 'late')) DEFAULT 'present',
  working_hours REAL DEFAULT 0.0,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(employee_id, date)
);

-- 5. Leave Types table
CREATE TABLE leave_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  default_days INTEGER NOT NULL,
  description TEXT
);

-- 6. Leave Requests table
CREATE TABLE leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  leave_type_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  hr_notes TEXT,
  impact_score TEXT CHECK(impact_score IN ('LOW', 'MEDIUM', 'HIGH')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
);

-- 7. Projects table
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  manager_id INTEGER,
  status TEXT CHECK(status IN ('active', 'completed', 'delayed')) DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER DEFAULT 0,
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 8. Tasks table
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  assigned_employee_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('completed', 'in_progress', 'pending', 'blocked')) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  estimated_hours INTEGER DEFAULT 0,
  completed_hours INTEGER DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 9. Task Dependencies table
CREATE TABLE task_dependencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  depends_on_task_id INTEGER NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE(task_id, depends_on_task_id)
);

-- 10. Payroll table
CREATE TABLE payroll (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  basic_salary REAL NOT NULL,
  allowances REAL DEFAULT 0.0,
  deductions REAL DEFAULT 0.0,
  net_salary REAL NOT NULL,
  payment_status TEXT CHECK(payment_status IN ('paid', 'pending')) DEFAULT 'pending',
  payslip_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(employee_id, month, year)
);

-- 11. Skills table
CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL
);

-- 12. Employee Skills table
CREATE TABLE employee_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  proficiency_level INTEGER CHECK(proficiency_level BETWEEN 1 AND 5) NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE(employee_id, skill_id)
);

-- 13. Notifications table
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK(type IN ('leave', 'task', 'system', 'alert')) DEFAULT 'system',
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. Workforce Risk table
CREATE TABLE workforce_risk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  risk_level TEXT CHECK(risk_level IN ('LOW', 'MEDIUM', 'HIGH')) NOT NULL,
  description TEXT NOT NULL,
  affected_entity_id TEXT, -- Can represent task ID, department ID, etc.
  resolved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 15. Workload table
CREATE TABLE workload (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER UNIQUE NOT NULL,
  workload_percentage INTEGER DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 16. Simulation Results table
CREATE TABLE simulation_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  leave_request_id INTEGER NOT NULL,
  scenario_type TEXT CHECK(scenario_type IN ('approve_all', 'approve_selected', 'reassign', 'shift_dates')) NOT NULL,
  availability_impact INTEGER NOT NULL, -- projected team availability %
  critical_roles_affected INTEGER NOT NULL,
  deadlines_at_risk INTEGER NOT NULL,
  risk_level TEXT CHECK(risk_level IN ('LOW', 'MEDIUM', 'HIGH')) NOT NULL,
  details TEXT, -- JSON structure of reassignments or details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id) ON DELETE CASCADE
);
