const express = require('express');
const { dbHelper } = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/employees/me/dashboard - Fetch employee's personal dashboard data
router.get('/me/dashboard', verifyToken, async (req, res) => {
  const empId = req.user.employeeId;

  try {
    // 1. Fetch Today's Attendance Check-in status
    // Use '2026-08-22' as default mock current date, or fallback to current date.
    const mockToday = '2026-08-22';
    const attendanceRow = await dbHelper.get(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [empId, mockToday]
    );

    // 2. Fetch Tasks Summary (assigned, completed, in progress, pending, blocked)
    const tasks = await dbHelper.all(
      'SELECT id, name, status, progress, priority, due_date, estimated_hours FROM tasks WHERE assigned_employee_id = ?',
      [empId]
    );

    const taskSummary = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      completionRate: 0,
      activeTasks: tasks.filter(t => t.status !== 'completed')
    };

    if (taskSummary.total > 0) {
      taskSummary.completionRate = Math.round(
        (tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / (taskSummary.total * 100)) * 100
      );
    }

    // 3. Fetch Leave Balances
    const leaveTypes = await dbHelper.all('SELECT * FROM leave_types');
    const leaveBalances = [];

    for (const lt of leaveTypes) {
      // Calculate approved days
      const approvedRow = await dbHelper.get(
        `SELECT SUM(strftime('%s', end_date) - strftime('%s', start_date) + 86400) / 86400 AS days 
         FROM leave_requests 
         WHERE employee_id = ? AND leave_type_id = ? AND status = 'approved'`,
        [empId, lt.id]
      );
      
      const used = approvedRow.days || 0;
      const remaining = Math.max(0, lt.default_days - used);

      leaveBalances.push({
        id: lt.id,
        name: lt.name,
        total: lt.default_days,
        used,
        remaining
      });
    }

    // 4. Fetch Pending Leaves
    const pendingLeaves = await dbHelper.all(
      `SELECT lr.*, lt.name as leave_type_name 
       FROM leave_requests lr 
       JOIN leave_types lt ON lr.leave_type_id = lt.id 
       WHERE lr.employee_id = ? AND lr.status = 'pending' 
       ORDER BY lr.start_date ASC`,
      [empId]
    );

    // 5. Fetch Workload percentage
    const workloadRow = await dbHelper.get(
      'SELECT workload_percentage FROM workload WHERE employee_id = ?',
      [empId]
    );
    const workload = workloadRow ? workloadRow.workload_percentage : 0;

    // 6. Fetch Upcoming deadlines (next 3 non-completed tasks)
    const deadlines = await dbHelper.all(
      `SELECT name, due_date, priority, progress 
       FROM tasks 
       WHERE assigned_employee_id = ? AND status != 'completed' AND due_date >= '2026-08-22'
       ORDER BY due_date ASC LIMIT 3`,
      [empId]
    );

    res.json({
      attendance: attendanceRow ? {
        id: attendanceRow.id,
        checkIn: attendanceRow.check_in_time,
        checkOut: attendanceRow.check_out_time,
        status: attendanceRow.status,
        workingHours: attendanceRow.working_hours
      } : null,
      taskSummary,
      leaveBalances,
      pendingLeaves,
      workload,
      deadlines
    });

  } catch (error) {
    console.error('Error fetching employee dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/employees/:id/passport - Fetch employee's Workforce Passport metrics
router.get('/:id/passport', verifyToken, async (req, res) => {
  const targetEmpId = req.params.id;

  try {
    const employee = await dbHelper.get(
      `SELECT e.*, d.name as department_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       WHERE e.id = ?`,
      [targetEmpId]
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Attendance stats
    const attendanceRecords = await dbHelper.all(
      'SELECT * FROM attendance WHERE employee_id = ?',
      [targetEmpId]
    );

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const lateDays = attendanceRecords.filter(r => r.status === 'late').length;

    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
    const punctualityRate = presentDays > 0 ? Math.round(((presentDays - lateDays) / presentDays) * 100) : 100;

    // Skills
    const skills = await dbHelper.all(
      `SELECT s.name, s.category, es.proficiency_level 
       FROM employee_skills es 
       JOIN skills s ON es.skill_id = s.id 
       WHERE es.employee_id = ?`,
      [targetEmpId]
    );

    // Active Tasks
    const activeTasks = await dbHelper.all(
      `SELECT t.*, p.name as project_name 
       FROM tasks t 
       JOIN projects p ON t.project_id = p.id 
       WHERE t.assigned_employee_id = ? AND t.status != 'completed'`,
      [targetEmpId]
    );

    // Completed Tasks Count
    const completedTasksCount = await dbHelper.get(
      'SELECT COUNT(*) as count FROM tasks WHERE assigned_employee_id = ? AND status = "completed"',
      [targetEmpId]
    );

    // Leave balance
    const leaveTypes = await dbHelper.all('SELECT * FROM leave_types');
    const leaveBalances = [];
    for (const lt of leaveTypes) {
      const approvedRow = await dbHelper.get(
        `SELECT SUM(strftime('%s', end_date) - strftime('%s', start_date) + 86400) / 86400 AS days 
         FROM leave_requests 
         WHERE employee_id = ? AND leave_type_id = ? AND status = 'approved'`,
        [targetEmpId, lt.id]
      );
      const used = approvedRow.days || 0;
      leaveBalances.push({
        name: lt.name,
        total: lt.default_days,
        used,
        remaining: Math.max(0, lt.default_days - used)
      });
    }

    res.json({
      profile: {
        id: employee.id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        email: employee.email,
        phone: employee.phone,
        jobTitle: employee.job_title,
        department: employee.department_name,
        hireDate: employee.hire_date,
        avatarUrl: employee.avatar_url,
        status: employee.status
      },
      metrics: {
        attendanceRate,
        punctualityRate,
        workload: employee.current_workload,
        completedTasks: completedTasksCount.count || 0,
        activeTasksCount: activeTasks.length
      },
      skills,
      activeTasks,
      leaveBalances
    });

  } catch (error) {
    console.error('Error fetching passport details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/employees - Get directory of all employees
router.get('/', verifyToken, async (req, res) => {
  try {
    const list = await dbHelper.all(
      `SELECT e.*, d.name as department_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       ORDER BY e.first_name ASC`
    );
    res.json(list);
  } catch (error) {
    console.error('Error fetching employees directory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/employees/:id/profile - Update limited profile details (email, phone, avatar)
router.put('/:id/profile', verifyToken, async (req, res) => {
  const targetId = req.params.id;
  const { phone } = req.body;

  // Protect so employees can only update their own profiles
  if (req.user.role !== 'hr' && req.user.employeeId !== parseInt(targetId)) {
    return res.status(403).json({ message: 'Forbidden: You can only edit your own profile' });
  }

  try {
    await dbHelper.run(
      'UPDATE employees SET phone = ? WHERE id = ?',
      [phone, targetId]
    );

    const updatedEmp = await dbHelper.get('SELECT * FROM employees WHERE id = ?', [targetId]);
    res.json({
      message: 'Profile updated successfully!',
      employee: updatedEmp
    });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
