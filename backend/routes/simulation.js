const express = require('express');
const { dbHelper } = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');
const { analyzeLeaveImpact } = require('../services/leavesAnalyzer');

const router = express.Router();

// POST /api/simulation/run - Run a What-If Workforce Simulation (HR only)
router.post('/run', verifyToken, requireRole(['hr']), async (req, res) => {
  const { leaveRequestId, scenarioType } = req.body;

  if (!leaveRequestId || !scenarioType) {
    return res.status(400).json({ message: 'Leave Request ID and Scenario Type are required.' });
  }

  try {
    // 1. Fetch leave request details
    const leave = await dbHelper.get(
      'SELECT lr.*, e.first_name, e.last_name, e.email, e.job_title FROM leave_requests lr JOIN employees e ON lr.employee_id = e.id WHERE lr.id = ?',
      [leaveRequestId]
    );

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // 2. Query pre-seeded simulation results if available (Arun Kumar's demo scenario)
    // Map scenario types from frontend to DB values
    let dbScenarioType = scenarioType;
    if (scenarioType === 'reassign') {
      dbScenarioType = 'reassign';
    } else if (scenarioType === 'approve_all') {
      dbScenarioType = 'approve_all';
    }

    const seededSim = await dbHelper.get(
      'SELECT * FROM simulation_results WHERE leave_request_id = ? AND scenario_type = ?',
      [leaveRequestId, dbScenarioType]
    );

    if (seededSim) {
      const parsedDetails = JSON.parse(seededSim.details);
      
      let recommendationText = '';
      if (scenarioType === 'approve_all') {
        recommendationText = `[NOT RECOMMENDED] Approving this leave causes 1 task deadline ("Payment API Gateway Integration") to slip past due date. Overall Engineering availability will drop to ${seededSim.availability_impact}%, crossing the risk threshold.`;
      } else if (scenarioType === 'reassign') {
        recommendationText = `[HIGHLY RECOMMENDED] Approving leave with task reassignment. Reassigning "Payment API Gateway Integration" to Priya Sharma clears the deadline risk. Priya has 62% workload and 94% skill match.`;
      } else if (scenarioType === 'shift_dates') {
        recommendationText = `[RECOMMENDED ALTERNATIVE] Suggesting shifted dates of Sep 1-3 avoids conflicts entirely since no key project milestones occur during this slot. Engineering availability stays at 91%.`;
      }

      return res.json({
        leaveRequestId,
        scenarioType,
        availabilityPct: seededSim.availability_impact,
        criticalRolesAffected: seededSim.critical_roles_affected,
        deadlinesAtRisk: seededSim.deadlines_at_risk,
        riskLevel: seededSim.risk_level,
        reasons: parsedDetails.reasons || [],
        recommendation: recommendationText
      });
    }

    // 3. Fallback: Dynamic mock simulator for non-seeded requests
    const impactAnalysis = await analyzeLeaveImpact(leaveRequestId);
    const beforeAvail = impactAnalysis.impactSummary.availabilityBefore;
    const afterAvail = impactAnalysis.impactSummary.availabilityAfter;

    let result = {
      leaveRequestId,
      scenarioType,
      availabilityPct: afterAvail,
      criticalRolesAffected: impactAnalysis.impactSummary.criticalRoleOffline ? 1 : 0,
      deadlinesAtRisk: impactAnalysis.impactSummary.deadlinesAtRisk,
      riskLevel: impactAnalysis.impactSummary.riskLevel,
      reasons: [],
      recommendation: ''
    };

    if (scenarioType === 'approve_all') {
      result.reasons = [
        `Team availability falls to ${afterAvail}%`,
        `${result.deadlinesAtRisk} task deadline(s) fall inside leave dates.`
      ];
      result.recommendation = `Approving this leave causes ${result.deadlinesAtRisk} task(s) to conflict with deadlines. Consider reassigning tasks to avoid delays.`;
      
    } else if (scenarioType === 'reassign') {
      result.availabilityPct = afterAvail;
      result.deadlinesAtRisk = 0;
      result.criticalRolesAffected = 0;
      result.riskLevel = 'LOW';
      result.reasons = [
        'All active task conflicts reassigned to backup resources.',
        'Deadline risks successfully cleared.'
      ];
      result.recommendation = `(Recommended) Approving leave with task reallocations. Active sprint objectives are fully secured by shifting work to compatible team members.`;
      
    } else if (scenarioType === 'shift_dates') {
      result.availabilityPct = beforeAvail;
      result.deadlinesAtRisk = 0;
      result.criticalRolesAffected = 0;
      result.riskLevel = 'LOW';
      result.reasons = [
        `Dates shifted to next month. No active tasks occur during shifted window.`,
        `Availability remains stable at ${beforeAvail}%.`
      ];
      result.recommendation = `(Alternative) Suggest shifting leave dates to next week/month to avoid sprint milestone blockages entirely.`;
    }

    res.json(result);

  } catch (error) {
    console.error('Error running What-If simulation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
