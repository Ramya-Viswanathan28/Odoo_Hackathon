require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { dbHelper } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRouter = require('./routes/auth');
const employeesRouter = require('./routes/employees');
const notificationsRouter = require('./routes/notifications');
const reportsRouter = require('./routes/reports');
const attendanceRouter = require('./routes/attendance');
const leavesRouter = require('./routes/leaves');
const payrollRouter = require('./routes/payroll');
const tasksRouter = require('./routes/tasks');
const projectsRouter = require('./routes/projects');
const simulationRouter = require('./routes/simulation');

app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leaves', leavesRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/simulation', simulationRouter);

// Basic health check route
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection by query
    const row = await dbHelper.get("SELECT sqlite_version() AS version");
    res.json({
      status: 'healthy',
      database: 'connected',
      sqlite_version: row.version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Dayflow backend server running on port ${PORT}`);
});
