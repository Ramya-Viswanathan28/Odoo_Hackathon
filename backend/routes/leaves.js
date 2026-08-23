const express = require('express');
const { dbHelper } = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/leaves - List all leave requests
router.get('/', verifyToken, async (req, res) => {
  try {
    let list;
    if (req.user.role === 'hr') {
      // HR sees all requests
      list = await dbHelper.all(
        `SELECT lr.*, e.first_name, e.last_name, e.job_title, d.name as department_name, lt.name as leave_type_name
         FROM leave_requests lr
         JOIN employees e ON lr.employee_id = e.id
         LEFT JOIN departments d ON e.department_id = d.id
         JOIN leave_types lt ON lr.leave_type_id = lt.id
         ORDER BY lr.created_at DESC`
      );
    } else {
      // Employee sees own requests
      list = await dbHelper.all(
        `SELECT lr.*, lt.name as leave_type_name
         FROM leave_requests lr
         JOIN leave_types lt ON lr.leave_type_id = lt.id
         WHERE lr.employee_id = ?
         ORDER BY lr.created_at DESC`,
        [req.user.employeeId]
      );
    }
    res.json(list);
  } catch (error) {
    console.error('Error fetching leave list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/leaves - Apply for a new leave request
router.post('/', verifyToken, async (req, res) => {
  const { leaveTypeId, startDate, endDate, reason } = req.body;
  const empId = req.user.employeeId;

  if (!leaveTypeId || !startDate || !endDate || !reason) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // 1. Analyze impact score dynamically
    // Check if the employee has any active tasks during these dates
    const conflictingTasks = await dbHelper.all(
      `SELECT * FROM tasks 
       WHERE assigned_employee_id = ? 
         AND status != 'completed' 
         AND (
           (start_date BETWEEN ? AND ?) OR 
           (due_date BETWEEN ? AND ?) OR
           (? BETWEEN start_date AND due_date)
         )`,
      [empId, startDate, endDate, startDate, endDate, startDate]
    );

    let impactScore = 'LOW';
    
    // If they have high-priority tasks napping or starting in that slot:
    if (conflictingTasks.length > 0) {
      const hasHighPriority = conflictingTasks.some(t => t.priority === 'high');
      impactScore = hasHighPriority ? 'HIGH' : 'MEDIUM';
    }

    // 2. Insert Leave Request
    const result = await dbHelper.run(
      `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason, status, impact_score) 
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [empId, leaveTypeId, startDate, endDate, reason, impactScore]
    );

    // 3. Notify HR Admin
    const hrUsers = await dbHelper.all('SELECT id FROM users WHERE role = "hr"');
    const emp = await dbHelper.get('SELECT first_name, last_name FROM employees WHERE id = ?', [empId]);
    const requesterName = `${emp.first_name} ${emp.last_name}`;

    for (const hr of hrUsers) {
      await dbHelper.run(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES (?, 'New Leave Request', ?, 'leave')`,
        [
          hr.id,
          `${requesterName} applied for leave from ${startDate} to ${endDate}. (Impact: ${impactScore})`
        ]
      );
    }

    // 4. Create an automatic risk radar entry if impact is HIGH
    if (impactScore === 'HIGH') {
      await dbHelper.run(
        `INSERT INTO workforce_risk (type, risk_level, description, affected_entity_id) 
         VALUES ('Leave Conflict', 'HIGH', ?, ?)`,
        [
          `Critical task risk: ${requesterName} requested leave during key project deliverables (${startDate} to ${endDate}).`,
          `leave_${result.id}`
        ]
      );
    }

    res.status(201).json({
      message: 'Leave application submitted successfully. Projected Impact: ' + impactScore,
      leaveId: result.id,
      impactScore
    });

  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/leaves/:id/action - HR approves or rejects a leave request
router.post('/:id/action', verifyToken, requireRole(['hr']), async (req, res) => {
  const leaveId = req.params.id;
  const { action, hrNotes } = req.body; // action: 'approved' or 'rejected'

  if (!action || !['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ message: 'Action must be approved or rejected.' });
  }

  try {
    const leave = await dbHelper.get(
      'SELECT lr.*, e.user_id, e.first_name, e.last_name FROM leave_requests lr JOIN employees e ON lr.employee_id = e.id WHERE lr.id = ?',
      [leaveId]
    );

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    await dbHelper.run(
      'UPDATE leave_requests SET status = ?, hr_notes = ? WHERE id = ?',
      [action, hrNotes || '', leaveId]
    );

    // Notify employee
    await dbHelper.run(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES (?, ?, ?, 'leave')`,
      [
        leave.user_id,
        `Leave Request ${action.toUpperCase()}`,
        `Your leave request from ${leave.start_date} to ${leave.end_date} has been ${action}. ${hrNotes ? 'Note: ' + hrNotes : ''}`
      ]
    );

    // If approved, mark the risk radar item as resolved
    if (action === 'approved' || action === 'rejected') {
      await dbHelper.run(
        'UPDATE workforce_risk SET resolved = 1 WHERE affected_entity_id = ?',
        [`leave_${leaveId}`]
      );
    }

    // If approved, recalculate/adjust employee workloads or trigger digital twin updates
    if (action === 'approved') {
      // In a full system we would redistribute or shift schedules.
      // Here, we can create notifications for task dependencies if needed.
    }

    res.json({
      message: `Leave request has been successfully ${action}.`,
      status: action
    });

  } catch (error) {
    console.error('Error actioning leave request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/leaves/:id/impact - Get Leave Impact Analysis (HR only)
router.get('/:id/impact', verifyToken, requireRole(['hr']), async (req, res) => {
  const leaveId = req.params.id;
  try {
    const { analyzeLeaveImpact } = require('../services/leavesAnalyzer');
    const analysis = await analyzeLeaveImpact(leaveId);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing leave impact:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

module.exports = router;
