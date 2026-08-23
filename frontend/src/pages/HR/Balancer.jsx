import React, { useState, useEffect } from 'react';
import { 
  BarChart2, AlertCircle, ArrowRight, UserCheck, 
  HelpCircle, CheckCircle2, ChevronRight, Activity, ArrowRightLeft 
} from 'lucide-react';

export default function Balancer() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected employee to balance
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empTasks, setEmpTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Reassignment dropdown state
  const [reassigningTaskId, setReassigningTaskId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candLoading, setCandLoading] = useState(false);
  const [selectedCandId, setSelectedCandId] = useState('');
  
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to load employee capacity lists');
      const data = await response.json();
      setEmployees(data.filter(e => e.status === 'active'));
      
      // Keep selected employee reference updated
      if (selectedEmp) {
        const updatedSelected = data.find(e => e.id === selectedEmp.id);
        setSelectedEmp(updatedSelected || null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = async (emp) => {
    setSelectedEmp(emp);
    setTasksLoading(true);
    setSuccess('');
    setError('');
    setReassigningTaskId(null);
    try {
      const response = await fetch(`http://localhost:5000/api/tasks?employeeId=${emp.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmpTasks(data.filter(t => t.status !== 'completed'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleOpenReassign = async (task) => {
    setReassigningTaskId(task.id);
    setCandLoading(true);
    setSelectedCandId('');
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${task.id}/recommendations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.recommendations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCandLoading(false);
    }
  };

  const triggerReassign = async (taskId) => {
    if (!selectedCandId) return;
    setTasksLoading(true);
    setSuccess('');
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/reassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employeeId: parseInt(selectedCandId) })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Reallocation failed');

      setSuccess(data.message);
      setReassigningTaskId(null);
      
      // Refresh listings
      await fetchStaff();
      if (selectedEmp) {
        // Refresh selected employee's active tasks list
        const refreshedTasksRes = await fetch(`http://localhost:5000/api/tasks?employeeId=${selectedEmp.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (refreshedTasksRes.ok) {
          const refreshedTasksData = await refreshedTasksRes.json();
          setEmpTasks(refreshedTasksData.filter(t => t.status !== 'completed'));
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setTasksLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Find imbalances
  const highLoadStaff = employees.filter(e => e.current_workload > 85);
  const lowLoadStaff = employees.filter(e => e.current_workload < 65);

  return (
    <div className="space-y-6">
      
      {/* Alert Banner */}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 rounded-xl text-rose-700 dark:text-rose-400 text-sm flex gap-2">
          <AlertCircle className="h-5 w-5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Recommendation Panel */}
      {highLoadStaff.length > 0 && lowLoadStaff.length > 0 && (
        <div className="bg-brand-50/50 dark:bg-brand-950/15 border border-brand-200 dark:border-brand-900/40 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <span className="p-3 bg-brand-500 text-white rounded-2xl animate-float shrink-0">
            <ArrowRightLeft className="h-6 w-6" />
          </span>
          <div className="space-y-2">
            <h4 className="font-extrabold text-brand-700 dark:text-brand-450 leading-tight">Workload Imbalance Detected</h4>
            <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed max-w-2xl">
              Currently, <strong className="text-navy-900 dark:text-white">{highLoadStaff[0].first_name} {highLoadStaff[0].last_name}</strong> is operating at high workload capacity ({highLoadStaff[0].current_workload}%), while <strong className="text-navy-900 dark:text-white">{lowLoadStaff[0].first_name} {lowLoadStaff[0].last_name}</strong> has available backup capacity ({lowLoadStaff[0].current_workload}%).
            </p>
            <p className="text-[11px] text-navy-450">
              💡 Tip: Click on {highLoadStaff[0].first_name} below to view and reallocate their tasks.
            </p>
          </div>
        </div>
      )}

      {/* Split layout: Staff Directory workloads vs Task list editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Workload list */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-base font-extrabold text-navy-850 dark:text-white border-b border-navy-100 dark:border-navy-800 pb-3 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-brand-500" />
            Staff Capacity Indexes
          </h3>

          <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {employees.map((emp) => {
              const isSelected = selectedEmp?.id === emp.id;
              const isOver = emp.current_workload > 85;
              const isUnder = emp.current_workload < 60;
              const barColor = isOver ? 'bg-rose-500' : (isUnder ? 'bg-emerald-500' : 'bg-brand-500');
              const textColor = isOver ? 'text-rose-500' : (isUnder ? 'text-emerald-500' : 'text-navy-400');
              
              return (
                <button
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  className={`w-full p-4 text-left rounded-2xl border transition-all flex justify-between items-center ${
                    isSelected 
                      ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/15' 
                      : 'border-navy-100 dark:border-navy-850 hover:bg-navy-50/50 dark:hover:bg-navy-850/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={emp.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.first_name}`}
                      alt="avatar" 
                      className="h-8 w-8 rounded-full bg-navy-100 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-xs block leading-tight">{emp.first_name} {emp.last_name}</span>
                      <span className="text-[10px] text-navy-400 block leading-tight truncate capitalize">{emp.job_title}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 min-w-[70px] space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className={textColor}>{emp.current_workload}%</span>
                    </div>
                    <div className="w-16 bg-navy-200 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${emp.current_workload}%` }}></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Employee Tasks reallocation */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEmp ? (
            <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-5">
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-navy-800 dark:text-white leading-tight">
                    Deliverables assigned to {selectedEmp.first_name}
                  </h3>
                  <p className="text-xs text-navy-400 mt-1">Current Workload: <strong className="text-brand-600 dark:text-brand-455">{selectedEmp.current_workload}%</strong></p>
                </div>
                <span className="bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 text-xs font-extrabold px-3 py-1 rounded-full">
                  {empTasks.length} Active tasks
                </span>
              </div>

              {/* Tasks List */}
              {tasksLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {empTasks.length === 0 ? (
                    <p className="text-xs text-navy-400 py-8 text-center">No active tasks assigned to this employee.</p>
                  ) : (
                    empTasks.map((task) => {
                      const isReassigning = reassigningTaskId === task.id;

                      return (
                        <div key={task.id} className="p-4 bg-navy-50/50 dark:bg-navy-850/15 border border-navy-150/40 dark:border-navy-800/40 rounded-2xl space-y-4">
                          
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex gap-2 items-center">
                                <span className="font-bold text-sm text-navy-900 dark:text-white leading-tight">{task.name}</span>
                                <span className="text-[9px] font-bold text-navy-400 bg-navy-100 dark:bg-navy-800 px-1.5 py-0.5 rounded uppercase">
                                  {task.priority}
                                </span>
                              </div>
                              <span className="text-[10px] text-navy-450 block mt-1">📂 Project: {task.project_name} &bull; Due: {task.due_date}</span>
                            </div>
                            <span className="text-xs text-navy-500 font-bold shrink-0">{task.progress}% complete</span>
                          </div>

                          {/* Reassign UI inside the card */}
                          {isReassigning ? (
                            <div className="p-4 bg-white dark:bg-navy-900 border border-brand-200 dark:border-brand-900/30 rounded-xl space-y-3">
                              <h5 className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1">
                                <Activity className="h-3.5 w-3.5" /> Reallocate Recommendation Candidates
                              </h5>

                              {candLoading ? (
                                <div className="py-4 flex justify-center">
                                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-brand-500"></div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {candidates.map((cand) => (
                                      <button
                                        key={cand.id}
                                        type="button"
                                        onClick={() => setSelectedCandId(cand.id)}
                                        className={`p-2.5 text-left rounded-xl border text-xs transition-all flex justify-between items-center ${
                                          selectedCandId === cand.id 
                                            ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/20' 
                                            : 'border-navy-100 dark:border-navy-800 hover:bg-navy-50 dark:hover:bg-navy-800/40'
                                        }`}
                                      >
                                        <div>
                                          <p className="font-bold">{cand.name}</p>
                                          <p className="text-[9px] text-navy-400">Match: {cand.skillMatch}% &bull; Load: {cand.workload}%</p>
                                        </div>
                                        <span className="text-[10px] font-extrabold text-brand-500 shrink-0">Select</span>
                                      </button>
                                    ))}
                                  </div>

                                  <div className="flex gap-2 justify-end pt-2">
                                    <button
                                      onClick={() => triggerReassign(task.id)}
                                      disabled={!selectedCandId}
                                      className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                    >
                                      <UserCheck className="h-3.5 w-3.5" /> Confirm Reassignment
                                    </button>
                                    <button
                                      onClick={() => setReassigningTaskId(null)}
                                      className="bg-navy-200 text-navy-700 dark:bg-navy-800 dark:text-navy-300 font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-navy-300 transition-all cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => handleOpenReassign(task)}
                                className="bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-brand-100/30"
                              >
                                Reallocate Task <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-12 text-center text-navy-400 shadow-sm">
              Select an employee from the index directory to view active workload and redistribute tasks.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
