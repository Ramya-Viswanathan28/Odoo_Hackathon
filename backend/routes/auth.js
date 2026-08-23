const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { dbHelper } = require('../config/database');
const { JWT_SECRET, verifyToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Check if user already exists
    const existingUser = await dbHelper.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if employee record already exists (e.g., seeded data)
    let employee = await dbHelper.get('SELECT * FROM employees WHERE email = ?', [email]);
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    // Insert User
    const userResult = await dbHelper.run(
      'INSERT INTO users (email, password_hash, role, is_verified, verification_token) VALUES (?, ?, ?, 0, ?)',
      [email, passwordHash, role, verificationToken]
    );
    const userId = userResult.id;

    // Link or Create Employee Record
    if (employee) {
      if (employee.user_id) {
        return res.status(400).json({ message: 'Employee profile already claimed' });
      }
      // Link existing employee to new user
      await dbHelper.run('UPDATE employees SET user_id = ? WHERE id = ?', [userId, employee.id]);
    } else {
      // Create a default employee record if not seeded
      // Determine department (e.g., Engineering for employees, HR for hr)
      const deptRow = await dbHelper.get('SELECT id FROM departments WHERE name = ?', [role === 'hr' ? 'Human Resources' : 'Engineering']);
      const departmentId = deptRow ? deptRow.id : null;
      
      const empResult = await dbHelper.run(
        `INSERT INTO employees (user_id, first_name, last_name, email, department_id, job_title, hire_date, current_workload, avatar_url) 
         VALUES (?, ?, ?, ?, ?, ?, DATE('now'), 0, ?)`,
        [
          userId, 
          firstName, 
          lastName, 
          email, 
          departmentId, 
          role === 'hr' ? 'HR Assistant' : 'Junior Developer',
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`
        ]
      );

      // Create workload row
      await dbHelper.run(
        'INSERT INTO workload (employee_id, workload_percentage) VALUES (?, 0)',
        [empResult.id]
      );
    }

    // Return verification info for frontend simulation
    res.status(201).json({
      message: 'Registration successful! Verification email simulated.',
      verificationToken,
      verificationLink: `http://localhost:5000/api/auth/verify/${verificationToken}`
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await dbHelper.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Get linked employee info
    const employee = await dbHelper.get('SELECT * FROM employees WHERE user_id = ?', [user.id]);
    if (!employee) {
      return res.status(400).json({ message: 'Employee profile not found' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        employeeId: employee.id,
        firstName: employee.first_name,
        lastName: employee.last_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: employee.id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        avatarUrl: employee.avatar_url,
        isVerified: user.is_verified === 1
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/verify/:token
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await dbHelper.get('SELECT id FROM users WHERE verification_token = ?', [token]);
    if (!user) {
      return res.status(400).send('<h1>Invalid or expired verification token</h1>');
    }

    await dbHelper.run(
      'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?',
      [user.id]
    );

    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #8b5cf6;">Dayflow Email Verification</h1>
        <p>Your email has been verified successfully!</p>
        <p>You can now close this tab and log in.</p>
      </div>
    `);

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send('<h1>Verification error</h1>');
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await dbHelper.get('SELECT id, email, role, is_verified FROM users WHERE id = ?', [req.user.id]);
    const employee = await dbHelper.get('SELECT * FROM employees WHERE user_id = ?', [req.user.id]);
    
    if (!user || !employee) {
      return res.status(404).json({ message: 'User or employee profile not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: employee.id,
      firstName: employee.first_name,
      lastName: employee.last_name,
      avatarUrl: employee.avatar_url,
      isVerified: user.is_verified === 1
    });

  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
