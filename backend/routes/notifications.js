const express = require('express');
const { dbHelper } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications - Get user notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const list = await dbHelper.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 15',
      [req.user.id]
    );
    res.json(list);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/notifications/read-all - Mark all as read
router.post('/read-all', verifyToken, async (req, res) => {
  try {
    await dbHelper.run(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
