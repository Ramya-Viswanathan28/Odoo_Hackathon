import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, ShieldAlert, Award, 
  ArrowRight, AlertCircle, CheckCircle2, User, Layers, Sparkles, X, Check, BarChart2 
} from 'lucide-react';

export default function LeaveManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // HR notes & actions
  const [hrNotes, setHrNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // What-If Simulator modal trigger
  const [simOpen, setSimOpen] = useState(false);
  const [simScenario, setSimScenario] = useState('approve_all'); // approve_all, reassign, shift_dates
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    // Parse query params to auto-select request if redirected from dashboard
    const query = new URLSearchParams(location.search);
    const reqId = query.get('request');
    if (reqId && requests.length > 0) {
      handleSelectRequest(parseInt(reqId));
    }
  }, [location.search, requests]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leaves', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch leave requests');
      const data = await response.json();
      setRequests(data);
      
      // Auto-select first request if no query param is active
      const query = new URLSearchParams(location.search);
      const reqId = query.get('request');
      if (!reqId && data.length > 0) {
        handleSelectRequest(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = async (requestId) => {
    setSelectedRequestId(requestId);
    setAnalysisLoading(true);
    setSuccess('');
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/leaves/${requestId}/impact`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to compute leave impact analysis');
      const data = await response.json();
      setAnalysis(data);
      setHrNotes(data.leaveDetails.hrNotes || '');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleLeaveAction = async (action) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/leaves/${selectedRequestId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action, hrNotes })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Action failed');

      setSuccess(`Leave request has been successfully ${action}!`);
      fetchRequests();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // What-If Simulation runner (Phase 9 placeholder trigger)
  const runSimulation = async (scenario) => {
    setSimScenario(scenario);
    setSimLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/simulation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          leaveRequestId: selectedRequestId,
          scenarioType: scenario
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSimResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimLoading(false);
    }
  };

  const openSimulator = () => {
    setSimOpen(true);
    setSimResult(null);
    runSimulation('approve_all'); // default run
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Alert Notices */}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm">
          {success}
        </div>
      )}

      {/* Split layout: List vs Analysis Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Master List of Requests */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-lg font-bold text-navy-800 dark:text-white border-b border-navy-100 dark:border-navy-800 pb-3">
            Active Requests
          </h3>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {requests.length === 0 ? (
              <p className="text-xs text-navy-400 py-6 text-center">No leave requests found.</p>
            ) : (
              requests.map((req) => {
                const isSelected = selectedRequestId === req.id;
                
                const isApproved = req.status === 'approved';
                const isPending = req.status === 'pending';
                const statusStyle = isApproved 
                  ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/20 dark:text-emerald-400' 
                  : (isPending ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-rose-100 text-rose-850 dark:bg-rose-950/20 dark:text-rose-400');
                
                const impactColors = {
                  HIGH: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20',
                  MEDIUM: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20',
                  LOW: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                };

                return (
                  <button
                    key={req.id}
                    onClick={() => handleSelectRequest(req.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      isSelected 
                        ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/15' 
                        : 'border-navy-100 dark:border-navy-800 hover:bg-navy-50/50 dark:hover:bg-navy-800/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-navy-800 dark:text-white leading-tight">{req.first_name} {req.last_name}</h4>
                        <span className="text-[10px] text-navy-400 font-semibold uppercase">{req.department_name} &bull; {req.leave_type_name}</span>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${impactColors[req.impact_score]}`}>
                        {req.impact_score || 'LOW'}
                      </span>
                    </div>

                    <div className="mt-3.5 flex justify-between items-center text-[10px]">
                      <span className="text-navy-500 font-mono font-bold">{req.start_date} to {req.end_date}</span>
                      <span className={`font-black uppercase px-2 py-0.5 rounded-md ${statusStyle}`}>
                        {req.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detailed Impact Analysis Screen */}
        <div className="xl:col-span-2 space-y-6">
          {analysisLoading ? (
            <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-12 text-center shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
              <p className="text-xs text-navy-400 mt-4">Running Leave Impact Analyzer algorithms...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              
              {/* Impact Banner Header */}
              <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="text-[10px] font-bold text-navy-400 uppercase tracking-widest block">ANALYSIS SCENARIO</span>
                  <h3 className="text-2xl font-black text-navy-900 dark:text-white mt-1 leading-tight">
                    {analysis.leaveDetails.employeeName} Leave Impact
                  </h3>
                  <p className="text-xs text-navy-400 mt-1 font-semibold">{analysis.leaveDetails.leaveType} &bull; {analysis.leaveDetails.startDate} to {analysis.leaveDetails.endDate}</p>
                </div>

                <button
                  onClick={openSimulator}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-5 py-3 rounded-2xl transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 animate-pulse-subtle cursor-pointer shrink-0"
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  SIMULATE IMPACT
                </button>
              </div>

              {/* Grid: Risk radar details vs Availability gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Risk Radar Box */}
                <div className="bg-white dark:bg-navy-900 border border-navy-250 dark:border-navy-800 rounded-3xl p-6 shadow-sm md:col-span-2 space-y-4">
                  <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
                    <h4 className="font-bold text-navy-800 dark:text-white flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-rose-500" />
                      Workforce Risk Radar
                    </h4>
                    
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                      analysis.impactSummary.riskLevel === 'HIGH' 
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                        : (analysis.impactSummary.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20')
                    }`}>
                      {analysis.impactSummary.riskLevel} RISK
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-navy-400 uppercase tracking-wide">Key Findings & Explainable Reasons:</p>
                    <ul className="space-y-2">
                      {analysis.impactSummary.reasons.map((reason, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start p-2 bg-navy-50/50 dark:bg-navy-800/30 rounded-xl font-semibold leading-relaxed">
                          <AlertCircle className="h-4.5 w-4.5 text-brand-500 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Team capacity availability gauges */}
                <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <h4 className="font-bold text-navy-800 dark:text-white mb-4">Team Availability</h4>
                  
                  <div className="space-y-4 my-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-navy-400">Current Availability</span>
                        <span className="font-bold text-navy-700 dark:text-navy-300">{analysis.impactSummary.availabilityBefore}%</span>
                      </div>
                      <div className="w-full bg-navy-100 dark:bg-navy-800 h-2.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analysis.impactSummary.availabilityBefore}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-navy-400">Projected If Approved</span>
                        <span className={`font-bold ${analysis.impactSummary.availabilityAfter < 70 ? 'text-rose-500' : 'text-amber-500'}`}>{analysis.impactSummary.availabilityAfter}%</span>
                      </div>
                      <div className="w-full bg-navy-100 dark:bg-navy-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${analysis.impactSummary.availabilityAfter < 70 ? 'bg-rose-500' : 'bg-brand-500'}`} 
                          style={{ width: `${analysis.impactSummary.availabilityAfter}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-navy-400 leading-normal mt-4">
                    Availability represents active staffing in the department. Target threshold is 70%.
                  </p>
                </div>

              </div>

              {/* Affected Tasks list */}
              <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-navy-800 dark:text-white border-b border-navy-100 dark:border-navy-800 pb-3 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-brand-500" />
                  Assigned Deliverables during Leave
                </h4>

                <div className="space-y-3">
                  {analysis.affectedTasks.length === 0 ? (
                    <p className="text-xs text-navy-400 py-4 text-center">No assigned active tasks overlap with this leave request.</p>
                  ) : (
                    analysis.affectedTasks.map((task) => (
                      <div key={task.id} className="p-4 bg-navy-50/50 dark:bg-navy-850/15 border border-navy-150/40 dark:border-navy-800/40 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <div className="flex gap-2 items-center">
                            <span className="font-bold text-sm text-navy-900 dark:text-white">{task.name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              task.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <span className="text-[10px] text-navy-400 font-semibold block mt-1">Project: {task.projectName}</span>
                        </div>

                        <div className="flex items-center gap-6 justify-between md:justify-end text-xs">
                          <div>
                            <span className="text-navy-400">Progress: <strong>{task.progress}%</strong></span>
                            {task.dependentTasksCount > 0 && (
                              <span className="text-amber-500 font-bold block text-[10px] mt-0.5">⚠️ {task.dependentTasksCount} task(s) blocked</span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            {task.isDeadlineAtRisk ? (
                              <span className="bg-rose-50 text-rose-600 dark:bg-rose-950/20 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase animate-pulse">
                                Deadline Conflict
                              </span>
                            ) : (
                              <span className="text-navy-400">Due {task.dueDate}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Console form */}
              {analysis.leaveDetails.status === 'pending' && (
                <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-bold text-navy-800 dark:text-white">HR Action Console</h4>
                  
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider">Leave Decision Note</label>
                    <textarea
                      value={hrNotes}
                      onChange={(e) => setHrNotes(e.target.value)}
                      placeholder="Add backup suggestions, reassignment notes, or reason for rejection..."
                      rows="3"
                      className="block w-full px-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all text-navy-800 dark:text-white"
                    ></textarea>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleLeaveAction('approved')}
                      disabled={actionLoading}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="h-4 w-4" /> Approve Leave
                    </button>
                    <button
                      onClick={() => handleLeaveAction('rejected')}
                      disabled={actionLoading}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X className="h-4 w-4" /> Reject Leave
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-12 text-center text-navy-400 shadow-sm">
              Select a leave request from the list to display Leave Impact calculations.
            </div>
          )}
        </div>

      </div>

      {/* WHAT-IF SIMULATOR MODAL (Phase 9 Preview) */}
      {simOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative">
            <button 
              onClick={() => setSimOpen(false)} 
              className="absolute top-4 right-4 p-2 text-navy-400 hover:text-navy-600 dark:hover:text-white rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              
              {/* Header */}
              <div className="border-b border-navy-100 dark:border-navy-800 pb-3 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-brand-500" />
                <div>
                  <h4 className="font-bold text-lg text-navy-900 dark:text-white">What-If Workforce Simulator</h4>
                  <p className="text-xs text-navy-450">Simulate operational scenarios before making critical HR decisions.</p>
                </div>
              </div>

              {/* Scenario Toggles */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => runSimulation('approve_all')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    simScenario === 'approve_all' 
                      ? 'border-brand-500 bg-brand-50/40 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400' 
                      : 'border-navy-100 dark:border-navy-800 hover:bg-navy-50 dark:hover:bg-navy-800'
                  }`}
                >
                  Approve Leave
                </button>
                <button
                  onClick={() => runSimulation('reassign')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    simScenario === 'reassign' 
                      ? 'border-brand-500 bg-brand-50/40 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400' 
                      : 'border-navy-100 dark:border-navy-800 hover:bg-navy-50 dark:hover:bg-navy-800'
                  }`}
                >
                  Reassign Task
                </button>
                <button
                  onClick={() => runSimulation('shift_dates')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    simScenario === 'shift_dates' 
                      ? 'border-brand-500 bg-brand-50/40 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400' 
                      : 'border-navy-100 dark:border-navy-800 hover:bg-navy-50 dark:hover:bg-navy-800'
                  }`}
                >
                  Shift Dates
                </button>
              </div>

              {/* Simulation Result Details */}
              {simLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
                </div>
              ) : simResult ? (
                <div className="space-y-5">
                  
                  {/* Scenario Summary Card */}
                  <div className="p-4 bg-navy-50 dark:bg-navy-850/30 rounded-2xl flex justify-between items-center border border-navy-100 dark:border-navy-800/40">
                    <div>
                      <span className="text-[10px] text-navy-450 font-bold uppercase tracking-wider block">Projected Capacity Outcome</span>
                      <span className="text-xs font-semibold text-navy-850 mt-1 block">Team Availability: <strong className="text-brand-600 dark:text-brand-400">{simResult.availabilityPct}%</strong></span>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      simResult.riskLevel === 'HIGH' 
                        ? 'bg-rose-50 text-rose-600' 
                        : (simResult.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600')
                    }`}>
                      {simResult.riskLevel} RISK STATE
                    </span>
                  </div>

                  {/* Reasons check */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-navy-400 uppercase tracking-wider block">Impact Insights:</span>
                    <ul className="space-y-2">
                      {simResult.reasons.map((r, idx) => (
                        <li key={idx} className="flex gap-2 p-2 bg-navy-50/50 dark:bg-navy-800/20 border border-navy-150/20 dark:border-navy-800/20 rounded-xl text-xs leading-normal">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${simScenario === 'reassign' && idx === 0 ? 'text-emerald-500' : 'text-brand-500'}`} />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Explainable Why? */}
                  <div className="p-4 border border-brand-100 dark:border-brand-900/30 bg-brand-50/30 dark:bg-brand-950/10 rounded-2xl">
                    <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Explainable AI Recommendation:</p>
                    <p className="text-xs mt-1.5 text-navy-700 dark:text-navy-300 leading-normal">
                      {simResult.recommendation}
                    </p>
                  </div>

                </div>
              ) : (
                <p className="text-xs text-navy-400 text-center py-6">Select a scenario to compute live projections.</p>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
