const { dbHelper } = require('../config/database');

/**
 * Recalculates the workload percentage of a specific employee 
 * based on their active assigned tasks and updates the database.
 * 
 * Workload formula: (Sum of remaining hours of active tasks / 40 hours) * 100
 */
async function recalculateWorkload(employeeId) {
  if (!employeeId) return;

  try {
    // Get all active tasks assigned to the employee
    const activeTasks = await dbHelper.all(
      'SELECT estimated_hours, progress FROM tasks WHERE assigned_employee_id = ? AND status != "completed"',
      [employeeId]
    );

    let remainingHours = 0;
    for (const task of activeTasks) {
      const taskProgress = task.progress || 0;
      const taskHours = task.estimated_hours || 0;
      remainingHours += taskHours * ((100 - taskProgress) / 100);
    }

    // Capacity baseline = 40 hours standard week
    // Max capped at 120%
    const calculatedWorkload = Math.min(120, Math.round((remainingHours / 40) * 100));

    // Update workload table
    await dbHelper.run(
      `INSERT INTO workload (employee_id, workload_percentage, last_updated) 
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(employee_id) DO UPDATE SET 
         workload_percentage = excluded.workload_percentage,
         last_updated = CURRENT_TIMESTAMP`,
      [employeeId, calculatedWorkload]
    );

    // Sync with employees table
    await dbHelper.run(
      'UPDATE employees SET current_workload = ? WHERE id = ?',
      [calculatedWorkload, employeeId]
    );

    return calculatedWorkload;
  } catch (error) {
    console.error(`Error recalculating workload for employee ${employeeId}:`, error);
  }
}

module.exports = { recalculateWorkload };
