const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { db, dbHelper } = require('../config/database');

const schemaPath = path.resolve(__dirname, 'schema.sql');

async function initDb() {
  try {
    console.log('Initializing database schema...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema SQL by semicolons to execute statements individually,
    // avoiding issues with multiple statements in a single run.
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      await dbHelper.exec(statement);
    }
    console.log('Database schema created successfully.');

    console.log('Generating seed data...');
    
    // Hash password once for all seeded users
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    // 1. Seed Departments
    const departments = [
      { name: 'Engineering', description: 'Core product engineering and development.' },
      { name: 'Product Management', description: 'Product strategy, roadmap, and specs.' },
      { name: 'Design', description: 'UI/UX and brand design.' },
      { name: 'Human Resources', description: 'People operations and recruiting.' },
      { name: 'Marketing', description: 'Growth, brand marketing, and sales support.' }
    ];

    const departmentIds = [];
    for (const dept of departments) {
      const result = await dbHelper.run(
        'INSERT INTO departments (name, description) VALUES (?, ?)',
        [dept.name, dept.description]
      );
      departmentIds.push(result.id);
    }
    const [engId, prodId, designId, hrId, mktgId] = departmentIds;

    // 2. Seed Skills
    const skills = [
      { name: 'Node.js', category: 'Backend' },
      { name: 'React', category: 'Frontend' },
      { name: 'SQLite', category: 'Database' },
      { name: 'API Design', category: 'Backend' },
      { name: 'UI/UX Design', category: 'Design' },
      { name: 'Product Strategy', category: 'Product' },
      { name: 'Project Management', category: 'Management' },
      { name: 'Technical Writing', category: 'Other' },
      { name: 'CSS/Tailwind', category: 'Frontend' }
    ];

    const skillIds = {};
    for (const skill of skills) {
      const result = await dbHelper.run(
        'INSERT INTO skills (name, category) VALUES (?, ?)',
        [skill.name, skill.category]
      );
      skillIds[skill.name] = result.id;
    }

    // 3. Create Users and Employees (30 employees total)
    // We will have:
    // - 1 HR Manager (admin)
    // - 20 Engineering employees
    // - 3 Product employees
    // - 3 Design employees
    // - 3 Marketing employees
    
    const employeeData = [
      // HR Admin
      { email: 'hr@dayflow.com', role: 'hr', first_name: 'Sarah', last_name: 'Jenkins', deptId: hrId, title: 'HR Manager', workload: 30 },
      
      // Engineering Team (Key Demo Users)
      { email: 'arun@dayflow.com', role: 'employee', first_name: 'Arun', last_name: 'Kumar', deptId: engId, title: 'Senior Software Engineer', workload: 91 },
      { email: 'priya@dayflow.com', role: 'employee', first_name: 'Priya', last_name: 'Sharma', deptId: engId, title: 'Software Engineer', workload: 62 },
      { email: 'karthik@dayflow.com', role: 'employee', first_name: 'Karthik', last_name: 'Nair', deptId: engId, title: 'Software Engineer', workload: 58 },
      { email: 'rahul@dayflow.com', role: 'employee', first_name: 'Rahul', last_name: 'Verma', deptId: engId, title: 'Tech Lead', workload: 97 },
      
      // More Engineering Team members (to reach 20 engineering)
      { email: 'amit@dayflow.com', role: 'employee', first_name: 'Amit', last_name: 'Patel', deptId: engId, title: 'DevOps Engineer', workload: 70 },
      { email: 'sneha@dayflow.com', role: 'employee', first_name: 'Sneha', last_name: 'Reddy', deptId: engId, title: 'QA Engineer', workload: 40 },
      { email: 'john@dayflow.com', role: 'employee', first_name: 'John', last_name: 'Doe', deptId: engId, title: 'Software Engineer', workload: 65 },
      { email: 'jane@dayflow.com', role: 'employee', first_name: 'Jane', last_name: 'Smith', deptId: engId, title: 'Software Engineer', workload: 80 },
      { email: 'vikram@dayflow.com', role: 'employee', first_name: 'Vikram', last_name: 'Singh', deptId: engId, title: 'Backend Developer', workload: 55 },
      { email: 'pooja@dayflow.com', role: 'employee', first_name: 'Pooja', last_name: 'Rao', deptId: engId, title: 'Frontend Developer', workload: 75 },
      { email: 'david@dayflow.com', role: 'employee', first_name: 'David', last_name: 'Lee', deptId: engId, title: 'Software Engineer', workload: 50 },
      { email: 'emily@dayflow.com', role: 'employee', first_name: 'Emily', last_name: 'Wang', deptId: engId, title: 'QA Automation', workload: 35 },
      { email: 'sanjay@dayflow.com', role: 'employee', first_name: 'Sanjay', last_name: 'Gupta', deptId: engId, title: 'Database Administrator', workload: 85 },
      { email: 'ananya@dayflow.com', role: 'employee', first_name: 'Ananya', last_name: 'Das', deptId: engId, title: 'Frontend Developer', workload: 60 },
      { email: 'michael@dayflow.com', role: 'employee', first_name: 'Michael', last_name: 'Brown', deptId: engId, title: 'Software Engineer', workload: 45 },
      { email: 'sarah.c@dayflow.com', role: 'employee', first_name: 'Sarah', last_name: 'Connor', deptId: engId, title: 'SecOps Engineer', workload: 30 },
      { email: 'robert@dayflow.com', role: 'employee', first_name: 'Robert', last_name: 'Miller', deptId: engId, title: 'Software Engineer', workload: 68 },
      { email: 'lisa@dayflow.com', role: 'employee', first_name: 'Lisa', last_name: 'Davis', deptId: engId, title: 'Backend Developer', workload: 72 },
      { email: 'arjun@dayflow.com', role: 'employee', first_name: 'Arjun', last_name: 'Mehta', deptId: engId, title: 'Software Engineer', workload: 50 },
      
      // Product Team (3)
      { email: 'neha@dayflow.com', role: 'employee', first_name: 'Neha', last_name: 'Joshi', deptId: prodId, title: 'Senior Product Manager', workload: 80 },
      { email: 'ryan@dayflow.com', role: 'employee', first_name: 'Ryan', last_name: 'Taylor', deptId: prodId, title: 'Product Manager', workload: 60 },
      { email: 'tanya@dayflow.com', role: 'employee', first_name: 'Tanya', last_name: 'Sen', deptId: prodId, title: 'Associate PM', workload: 45 },
      
      // Design Team (3)
      { email: 'rohan@dayflow.com', role: 'employee', first_name: 'Rohan', last_name: 'Deshmukh', deptId: designId, title: 'Lead Designer', workload: 85 },
      { email: 'kavita@dayflow.com', role: 'employee', first_name: 'Kavita', last_name: 'Iyer', deptId: designId, title: 'UI/UX Designer', workload: 65 },
      { email: 'mark@dayflow.com', role: 'employee', first_name: 'Mark', last_name: 'Wilson', deptId: designId, title: 'Graphic Designer', workload: 50 },
      
      // HR Team (2 more, making 3 total HR users)
      { email: 'hr2@dayflow.com', role: 'hr', first_name: 'Alice', last_name: 'Johnson', deptId: hrId, title: 'HR Specialist', workload: 40 },
      { email: 'hr3@dayflow.com', role: 'hr', first_name: 'Bob', last_name: 'Williams', deptId: hrId, title: 'HR Generalist', workload: 35 },
      
      // Marketing Team (3)
      { email: 'kunal@dayflow.com', role: 'employee', first_name: 'Kunal', last_name: 'Kapoor', deptId: mktgId, title: 'Marketing Director', workload: 70 },
      { email: 'ria@dayflow.com', role: 'employee', first_name: 'Ria', last_name: 'Malhotra', deptId: mktgId, title: 'Growth Marketer', workload: 55 },
      { email: 'chris@dayflow.com', role: 'employee', first_name: 'Chris', last_name: 'Evans', deptId: mktgId, title: 'Content Writer', workload: 40 }
    ];

    const employees = [];
    for (const emp of employeeData) {
      // Insert User
      const userResult = await dbHelper.run(
        'INSERT INTO users (email, password_hash, role, is_verified) VALUES (?, ?, ?, 1)',
        [emp.email, defaultPasswordHash, emp.role]
      );
      
      // Insert Employee linked to User
      const empResult = await dbHelper.run(
        `INSERT INTO employees (user_id, first_name, last_name, email, department_id, job_title, hire_date, current_workload, avatar_url) 
         VALUES (?, ?, ?, ?, ?, ?, '2025-01-15', ?, ?)`,
        [
          userResult.id,
          emp.first_name,
          emp.last_name,
          emp.email,
          emp.deptId,
          emp.title,
          emp.workload,
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.first_name}`
        ]
      );
      
      employees.push({
        id: empResult.id,
        user_id: userResult.id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        department_id: emp.deptId,
        title: emp.title
      });

      // Insert Initial Workload
      await dbHelper.run(
        'INSERT INTO workload (employee_id, workload_percentage) VALUES (?, ?)',
        [empResult.id, emp.workload]
      );
    }

    // Set department managers
    const sarahJenkins = employees.find(e => e.email === 'hr@dayflow.com');
    const rahulVerma = employees.find(e => e.email === 'rahul@dayflow.com');
    const nehaJoshi = employees.find(e => e.email === 'neha@dayflow.com');
    const rohanDeshmukh = employees.find(e => e.email === 'rohan@dayflow.com');
    const kunalKapoor = employees.find(e => e.email === 'kunal@dayflow.com');

    if (sarahJenkins) await dbHelper.run('UPDATE departments SET manager_id = ? WHERE id = ?', [sarahJenkins.id, hrId]);
    if (rahulVerma) await dbHelper.run('UPDATE departments SET manager_id = ? WHERE id = ?', [rahulVerma.id, engId]);
    if (nehaJoshi) await dbHelper.run('UPDATE departments SET manager_id = ? WHERE id = ?', [nehaJoshi.id, prodId]);
    if (rohanDeshmukh) await dbHelper.run('UPDATE departments SET manager_id = ? WHERE id = ?', [rohanDeshmukh.id, designId]);
    if (kunalKapoor) await dbHelper.run('UPDATE departments SET manager_id = ? WHERE id = ?', [kunalKapoor.id, mktgId]);

    // 4. Seed Employee Skills (for critical path logic)
    const skillMappings = [
      // Arun Kumar
      { email: 'arun@dayflow.com', skill: 'Node.js', level: 5 },
      { email: 'arun@dayflow.com', skill: 'API Design', level: 5 },
      { email: 'arun@dayflow.com', skill: 'SQLite', level: 4 },
      // Priya Sharma (Ideal backup)
      { email: 'priya@dayflow.com', skill: 'Node.js', level: 4 },
      { email: 'priya@dayflow.com', skill: 'API Design', level: 4 },
      { email: 'priya@dayflow.com', skill: 'React', level: 4 },
      // Karthik Nair (Medium backup)
      { email: 'karthik@dayflow.com', skill: 'Node.js', level: 3 },
      { email: 'karthik@dayflow.com', skill: 'API Design', level: 3 },
      { email: 'karthik@dayflow.com', skill: 'SQLite', level: 3 },
      // Rahul Verma (High workload, but has the skills)
      { email: 'rahul@dayflow.com', skill: 'Node.js', level: 5 },
      { email: 'rahul@dayflow.com', skill: 'API Design', level: 5 },
      { email: 'rahul@dayflow.com', skill: 'Project Management', level: 5 }
    ];

    // Give remaining employees some default skills dynamically
    for (const mapping of skillMappings) {
      const emp = employees.find(e => e.email === mapping.email);
      const skillId = skillIds[mapping.skill];
      if (emp && skillId) {
        await dbHelper.run(
          'INSERT OR IGNORE INTO employee_skills (employee_id, skill_id, proficiency_level) VALUES (?, ?, ?)',
          [emp.id, skillId, mapping.level]
        );
      }
    }

    // Default skills for other devs
    const otherDevs = employees.filter(e => e.department_id === engId && !['arun@dayflow.com', 'priya@dayflow.com', 'karthik@dayflow.com', 'rahul@dayflow.com'].includes(e.email));
    for (const dev of otherDevs) {
      const skillName = Math.random() > 0.5 ? 'React' : 'CSS/Tailwind';
      await dbHelper.run(
        'INSERT OR IGNORE INTO employee_skills (employee_id, skill_id, proficiency_level) VALUES (?, ?, ?)',
        [dev.id, skillIds[skillName], 3]
      );
    }

    // 5. Seed Projects
    const projects = [
      { name: 'Hospital Management System', description: 'A state-of-the-art SaaS medical records and clinic workflow manager.', managerEmail: 'rahul@dayflow.com', status: 'active', start: '2026-08-01', end: '2026-09-30', progress: 45 },
      { name: 'Employee Engagement App', description: 'Internal tool for peer feedback and surveys.', managerEmail: 'neha@dayflow.com', status: 'active', start: '2026-07-01', end: '2026-08-31', progress: 85 },
      { name: 'Odoo Custom Modules Phase 2', description: 'Building bespoke accounting modules.', managerEmail: 'rahul@dayflow.com', status: 'active', start: '2026-08-15', end: '2026-11-30', progress: 10 }
    ];

    const projectIds = [];
    for (const proj of projects) {
      const mgr = employees.find(e => e.email === proj.managerEmail);
      const result = await dbHelper.run(
        `INSERT INTO projects (name, description, manager_id, status, start_date, end_date, progress) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [proj.name, proj.description, mgr ? mgr.id : null, proj.status, proj.start, proj.end, proj.progress]
      );
      projectIds.push(result.id);
    }
    const [hmsProjId, eeaProjId, odooProjId] = projectIds;

    // 6. Seed Leave Types
    const leaveTypes = [
      { name: 'Annual Leave', default_days: 18, description: 'Paid time off for holidays or personal use.' },
      { name: 'Sick Leave', default_days: 12, description: 'Paid leave for illness or medical visits.' },
      { name: 'Casual Leave', default_days: 6, description: 'Short-term personal absences.' },
      { name: 'Unpaid Leave', default_days: 30, description: 'Leave without pay.' }
    ];

    const leaveTypeIds = {};
    for (const lt of leaveTypes) {
      const result = await dbHelper.run(
        'INSERT INTO leave_types (name, default_days, description) VALUES (?, ?, ?)',
        [lt.name, lt.default_days, lt.description]
      );
      leaveTypeIds[lt.name] = result.id;
    }

    // 7. Seed Leave Requests (Supporting Team Coverage & Simulator Scenario)
    // Demo Scenario: Arun requests leave Aug 25-27.
    // Engineering department availability should drop.
    // To drop availability significantly and create high risk:
    // Let's have multiple other developers in Engineering already ON APPROVED LEAVE during this same period.
    const arunEmp = employees.find(e => e.email === 'arun@dayflow.com');
    
    // Seed Arun's pending leave
    const arunLeave = await dbHelper.run(
      `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason, status, hr_notes, impact_score) 
       VALUES (?, ?, '2026-08-25', '2026-08-27', 'Family wedding out of town', 'pending', NULL, 'HIGH')`,
      [arunEmp.id, leaveTypeIds['Annual Leave']]
    );

    // Seed approved leaves for other Engineering developers during Aug 25-27
    const engDevsOnLeave = [
      { email: 'amit@dayflow.com', start: '2026-08-20', end: '2026-08-26', reason: 'Personal work' },
      { email: 'sneha@dayflow.com', start: '2026-08-24', end: '2026-08-28', reason: 'Health check' },
      { email: 'john@dayflow.com', start: '2026-08-25', end: '2026-08-27', reason: 'Family trip' },
      { email: 'pooja@dayflow.com', start: '2026-08-22', end: '2026-08-29', reason: 'Vacation' }
    ];

    for (const leaveInfo of engDevsOnLeave) {
      const emp = employees.find(e => e.email === leaveInfo.email);
      if (emp) {
        await dbHelper.run(
          `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason, status, impact_score) 
           VALUES (?, ?, ?, ?, ?, 'approved', 'MEDIUM')`,
          [emp.id, leaveTypeIds['Annual Leave'], leaveInfo.start, leaveInfo.end, leaveInfo.reason]
        );
      }
    }

    // 8. Seed Tasks (50+ Tasks across projects)
    // Critical Task: Payment API assigned to Arun Kumar, due Aug 26
    const tasks = [
      // HMS Project Tasks (Engineering)
      { project_id: hmsProjId, assignedEmail: 'arun@dayflow.com', name: 'Payment API Gateway Integration', desc: 'Implement stripe and paypal payment hooks with custom callbacks.', status: 'in_progress', progress: 80, priority: 'high', start: '2026-08-10', due: '2026-08-26', est: 40, comp: 32 },
      { project_id: hmsProjId, assignedEmail: 'rahul@dayflow.com', name: 'Architecture Review & EHR Security', desc: 'Secure medical records using encrypted columns in databases.', status: 'in_progress', progress: 60, priority: 'high', start: '2026-08-01', due: '2026-08-30', est: 60, comp: 36 },
      { project_id: hmsProjId, assignedEmail: 'priya@dayflow.com', name: 'Patient Dashboard UI Components', desc: 'Build charts for vital signs, patient cards, and doctors queues.', status: 'in_progress', progress: 75, priority: 'medium', start: '2026-08-05', due: '2026-08-24', est: 30, comp: 22 },
      { project_id: hmsProjId, assignedEmail: 'karthik@dayflow.com', name: 'Doctor Consultation Schedulers', desc: 'Implement slot booking algorithms with timezone overrides.', status: 'pending', progress: 0, priority: 'medium', start: '2026-08-20', due: '2026-09-05', est: 45, comp: 0 },
      { project_id: hmsProjId, assignedEmail: 'vikram@dayflow.com', name: 'EHR Database Schema Design', desc: 'Design indexes for high volume queries on electronic medical records.', status: 'completed', progress: 100, priority: 'high', start: '2026-08-01', due: '2026-08-10', est: 25, comp: 25 },
      
      // Dependent tasks
      { project_id: hmsProjId, assignedEmail: 'pooja@dayflow.com', name: 'Billing Invoice PDF generator', desc: 'Depends on Payment API. Generates and mails printable receipts.', status: 'pending', progress: 0, priority: 'high', start: '2026-08-27', due: '2026-09-05', est: 20, comp: 0 },
      
      // EEA Project Tasks (Design/Product/Eng)
      { project_id: eeaProjId, assignedEmail: 'rohan@dayflow.com', name: 'Figma Design System', desc: 'Define color palette, components, and typography rules.', status: 'completed', progress: 100, priority: 'high', start: '2026-07-01', due: '2026-07-15', est: 30, comp: 30 },
      { project_id: eeaProjId, assignedEmail: 'kavita@dayflow.com', name: 'Employee Engagement Mockups', desc: 'Wireframes and visual interface for surveys.', status: 'completed', progress: 100, priority: 'medium', start: '2026-07-16', due: '2026-07-31', est: 40, comp: 40 },
      { project_id: eeaProjId, assignedEmail: 'neha@dayflow.com', name: 'PRD and Survey Questions Spec', desc: 'Finalize standard questions and feedback weights.', status: 'completed', progress: 100, priority: 'high', start: '2026-07-01', due: '2026-07-10', est: 20, comp: 20 },
      { project_id: eeaProjId, assignedEmail: 'ananya@dayflow.com', name: 'Survey UI Frontend', desc: 'Build interactive card views in React.', status: 'in_progress', progress: 90, priority: 'medium', start: '2026-08-01', due: '2026-08-20', est: 35, comp: 31 },
      { project_id: eeaProjId, assignedEmail: 'david@dayflow.com', name: 'Feedback Aggregation Microservice', desc: 'Node backend calculating moving averages for scores.', status: 'in_progress', progress: 70, priority: 'high', start: '2026-08-05', due: '2026-08-25', est: 50, comp: 35 }
    ];

    const seededTasks = [];
    for (const t of tasks) {
      const emp = employees.find(e => e.email === t.assignedEmail);
      const result = await dbHelper.run(
        `INSERT INTO tasks (project_id, assigned_employee_id, name, description, status, progress, priority, start_date, due_date, estimated_hours, completed_hours) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.project_id, emp ? emp.id : null, t.name, t.desc, t.status, t.progress, t.priority, t.start, t.due, t.est, t.comp]
      );
      seededTasks.push({ id: result.id, name: t.name });
    }

    // Set Task Dependencies: Billing Invoice PDF generator (Task id 6) depends on Payment API (Task id 1)
    const paymentApiTask = seededTasks.find(t => t.name === 'Payment API Gateway Integration');
    const pdfTask = seededTasks.find(t => t.name === 'Billing Invoice PDF generator');
    if (paymentApiTask && pdfTask) {
      await dbHelper.run(
        'INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES (?, ?)',
        [pdfTask.id, paymentApiTask.id]
      );
    }

    // Generate 40 more simple dummy tasks to reach 50+ tasks across 30 employees
    console.log('Generating 40 additional mock tasks for directory listings...');
    const allProjIds = [hmsProjId, eeaProjId, odooProjId];
    const taskPriorities = ['low', 'medium', 'high'];
    const taskStatuses = ['completed', 'in_progress', 'pending', 'blocked'];
    
    for (let i = 1; i <= 40; i++) {
      const projId = allProjIds[i % allProjIds.length];
      const employee = employees[i % employees.length];
      const status = taskStatuses[i % taskStatuses.length];
      const progress = status === 'completed' ? 100 : (status === 'in_progress' ? Math.floor(Math.random() * 8) * 10 + 10 : 0);
      const priority = taskPriorities[i % taskPriorities.length];
      
      await dbHelper.run(
        `INSERT INTO tasks (project_id, assigned_employee_id, name, description, status, progress, priority, start_date, due_date, estimated_hours, completed_hours) 
         VALUES (?, ?, ?, ?, ?, ?, ?, '2026-08-10', '2026-09-15', 20, ?)`,
        [
          projId,
          employee.id,
          `Feature Integration Submodule #${i}`,
          `Automated description for task number ${i}. Needs verification and QA testing.`,
          status,
          progress,
          priority,
          status === 'completed' ? 20 : Math.floor(progress * 0.2)
        ]
      );
    }

    // 9. Seed Attendance records for the last 5 days
    console.log('Seeding attendance history...');
    const dateStrings = ['2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22'];
    
    for (const date of dateStrings) {
      for (const emp of employees) {
        // Skip check-ins for developers already on approved leaves
        const onLeave = await dbHelper.get(
          'SELECT id FROM leave_requests WHERE employee_id = ? AND status = "approved" AND ? BETWEEN start_date AND end_date',
          [emp.id, date]
        );

        if (onLeave) {
          await dbHelper.run(
            'INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, status, working_hours) VALUES (?, ?, NULL, NULL, "absent", 0.0)',
            [emp.id, date]
          );
          continue;
        }

        // Randomize attendance status
        const rand = Math.random();
        let status = 'present';
        let checkIn = '09:00:00';
        let checkOut = '17:30:00';
        let hours = 8.5;

        if (rand > 0.95) {
          status = 'absent';
          checkIn = null;
          checkOut = null;
          hours = 0.0;
        } else if (rand > 0.85) {
          status = 'late';
          checkIn = '09:45:00';
          checkOut = '17:30:00';
          hours = 7.75;
        }

        await dbHelper.run(
          'INSERT OR IGNORE INTO attendance (employee_id, date, check_in_time, check_out_time, status, working_hours) VALUES (?, ?, ?, ?, ?, ?)',
          [emp.id, date, checkIn, checkOut, status, hours]
        );
      }
    }

    // 10. Seed Payroll for July 2026
    console.log('Seeding payroll history...');
    for (const emp of employees) {
      const isHr = emp.email.includes('hr');
      const baseSalary = isHr ? 6500 : (emp.title.includes('Senior') || emp.title.includes('Lead') ? 8500 : 5000);
      const allowances = Math.round(baseSalary * 0.12);
      const deductions = Math.round(baseSalary * 0.08);
      const netSalary = baseSalary + allowances - deductions;

      await dbHelper.run(
        `INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary, payment_status, payslip_url) 
         VALUES (?, 7, 2026, ?, ?, ?, ?, 'paid', ?)`,
        [emp.id, baseSalary, allowances, deductions, netSalary, `/slips/slip_${emp.id}_2026_07.pdf`]
      );
    }

    // 11. Seed Notifications
    const alertUser = employees.find(e => e.email === 'hr@dayflow.com');
    if (alertUser) {
      await dbHelper.run(
        `INSERT INTO notifications (user_id, title, message, type, is_read) 
         VALUES (?, 'Critical Leave Overlap Alert', 'Arun Kumar requested leave for Aug 25-27, which intersects with 4 other engineering absences.', 'alert', 0)`,
        [alertUser.user_id]
      );
      await dbHelper.run(
        `INSERT INTO notifications (user_id, title, message, type, is_read) 
         VALUES (?, 'Workforce Risk Detected', 'Engineering team availability is projected to drop below 70% next week.', 'alert', 0)`,
        [alertUser.user_id]
      );
    }

    const arunUser = employees.find(e => e.email === 'arun@dayflow.com');
    if (arunUser) {
      await dbHelper.run(
        `INSERT INTO notifications (user_id, title, message, type, is_read) 
         VALUES (?, 'Task Nearing Deadline', 'Your task \"Payment API Gateway Integration\" is due on Aug 26.', 'task', 0)`,
        [arunUser.user_id]
      );
    }

    // 12. Seed Simulation Results (Pre-calculated comparison scenario)
    // Run ID: 1
    // Leave ID: 1 (Arun's leave request)
    // Scenario 1: Approve All
    await dbHelper.run(
      `INSERT INTO simulation_results (leave_request_id, scenario_type, availability_impact, critical_roles_affected, deadlines_at_risk, risk_level, details) 
       VALUES (?, 'approve_all', 63, 2, 1, 'HIGH', '{"reassignments":[], "reasons":["Team availability falls to 63% (threshold is 70%)", "2 critical roles offline (Senior Software Engineer, QA Specialist)", "1 critical deadline affected: Payment API due Aug 26"]}')`,
      [arunLeave.id]
    );

    // Scenario 2: Reassign Tasks
    await dbHelper.run(
      `INSERT INTO simulation_results (leave_request_id, scenario_type, availability_impact, critical_roles_affected, deadlines_at_risk, risk_level, details) 
       VALUES (?, 'reassign', 63, 0, 0, 'LOW', '{"reassignments":[{"task_id":1, "task_name":"Payment API Gateway Integration", "from_employee_id":2, "from_employee_name":"Arun Kumar", "to_employee_id":3, "to_employee_name":"Priya Sharma", "match_score":94}], "reasons":["Reassigning task to Priya Sharma resolves the deadline risk", "Team availability remains low at 63% but active dependencies are fully covered"]}')`,
      [arunLeave.id]
    );

    console.log('Database seeded successfully with all mock entities!');

  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    await dbHelper.close();
  }
}

initDb();
