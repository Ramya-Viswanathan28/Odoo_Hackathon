const express = require('express');
const { dbHelper } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/projects - List all projects
router.get('/', verifyToken, async (req, res) => {
  try {
    const list = await dbHelper.all(
      `SELECT p.*, e.first_name as manager_first_name, e.last_name as manager_last_name 
       FROM projects p
       LEFT JOIN employees e ON p.manager_id = e.id
       ORDER BY p.start_date DESC`
    );
    res.json(list);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/projects/:id - Get specific project details along with its tasks
router.get('/:id', verifyToken, async (req, res) => {
  const projectId = req.params.id;
  try {
    const project = await dbHelper.get(
      `SELECT p.*, e.first_name as manager_first_name, e.last_name as manager_last_name 
       FROM projects p
       LEFT JOIN employees e ON p.manager_id = e.id
       WHERE p.id = ?`,
      [projectId]
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await dbHelper.all(
      `SELECT t.*, e.first_name, e.last_name 
       FROM tasks t
       LEFT JOIN employees e ON t.assigned_employee_id = e.id
       WHERE t.project_id = ?
       ORDER BY t.due_date ASC`,
      [projectId]
    );

    res.json({
      project,
      tasks
    });
  } catch (error) {
    console.error('Error fetching project detail:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
