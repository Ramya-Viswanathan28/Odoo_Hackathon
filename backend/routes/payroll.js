const express = require('express');
const { dbHelper } = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/payroll - List payrolls
router.get('/', verifyToken, async (req, res) => {
  try {
    let list;
    if (req.user.role === 'hr') {
      list = await dbHelper.all(
        `SELECT p.*, e.first_name, e.last_name, e.job_title, d.name as department_name 
         FROM payroll p
         JOIN employees e ON p.employee_id = e.id
         LEFT JOIN departments d ON e.department_id = d.id
         ORDER BY p.year DESC, p.month DESC`
      );
    } else {
      list = await dbHelper.all(
        `SELECT * FROM payroll WHERE employee_id = ? ORDER BY year DESC, month DESC`,
        [req.user.employeeId]
      );
    }
    res.json(list);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/payroll - Create or update a payroll entry (HR only)
router.post('/', verifyToken, requireRole(['hr']), async (req, res) => {
  const { employeeId, month, year, basicSalary, allowances, deductions, paymentStatus } = req.body;

  if (!employeeId || !month || !year || !basicSalary) {
    return res.status(400).json({ message: 'Employee ID, month, year and basic salary are required.' });
  }

  const allowancesVal = parseFloat(allowances) || 0.0;
  const deductionsVal = parseFloat(deductions) || 0.0;
  const basicSalaryVal = parseFloat(basicSalary);
  const netSalary = basicSalaryVal + allowancesVal - deductionsVal;

  try {
    await dbHelper.run(
      `INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary, payment_status, payslip_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(employee_id, month, year) DO UPDATE SET
         basic_salary = excluded.basic_salary,
         allowances = excluded.allowances,
         deductions = excluded.deductions,
         net_salary = excluded.net_salary,
         payment_status = excluded.payment_status`,
      [
        employeeId,
        month,
        year,
        basicSalaryVal,
        allowancesVal,
        deductionsVal,
        netSalary,
        paymentStatus || 'pending',
        `/slips/slip_${employeeId}_${year}_${month}.pdf`
      ]
    );

    res.json({ message: 'Payroll details updated successfully!', netSalary });
  } catch (error) {
    console.error('Error updating payroll:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
