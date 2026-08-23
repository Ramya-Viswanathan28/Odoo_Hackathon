const express = require('express');
const { dbHelper } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/attendance/me/history - Fetch logged-in employee's attendance logs
router.get('/me/history', verifyToken, async (req, res) => {
  const empId = req.user.employeeId;
  try {
    const list = await dbHelper.all(
      'SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT 30',
      [empId]
    );
    res.json(list);
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/attendance/check-in - Record check-in for today
router.post('/check-in', verifyToken, async (req, res) => {
  const empId = req.user.employeeId;
  const mockToday = '2026-08-22';
  
  // Custom mock times
  const checkInTime = '09:00:00';

  try {
    // Check if check-in already recorded
    const existing = await dbHelper.get(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [empId, mockToday]
    );

    if (existing) {
      return res.status(400).json({ message: 'Already checked in for today.' });
    }

    await dbHelper.run(
      'INSERT INTO attendance (employee_id, date, check_in_time, status, working_hours) VALUES (?, ?, ?, "present", 0.0)',
      [empId, mockToday, checkInTime]
    );

    res.json({ message: 'Checked in successfully at ' + checkInTime });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/attendance/check-out - Record check-out for today
router.post('/check-out', verifyToken, async (req, res) => {
  const empId = req.user.employeeId;
  const mockToday = '2026-08-22';
  const checkOutTime = '17:30:00';
  const workingHours = 8.5;

  try {
    const record = await dbHelper.get(
      'SELECT id, check_in_time FROM attendance WHERE employee_id = ? AND date = ?',
      [empId, mockToday]
    );

    if (!record) {
      return res.status(400).json({ message: 'Cannot check out. No check-in record found for today.' });
    }

    await dbHelper.run(
      'UPDATE attendance SET check_out_time = ?, working_hours = ? WHERE id = ?',
      [checkOutTime, workingHours, record.id]
    );

    res.json({ message: 'Checked out successfully at ' + checkOutTime + '. Work shift: ' + workingHours + ' hours.' });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
