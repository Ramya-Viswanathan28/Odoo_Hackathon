import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Clock, ShieldAlert, Users, 
  Layers, ChevronRight, AlertTriangle, ArrowRight, UserCheck 
} from 'lucide-react';

export default function HRTasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reassigningTaskId, setReassigningTaskId] = useState(null);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');

  // Filtering state
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchTasksAndStaff();
  }, []);

  const fetchTasksAndStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch tasks
      const tasksRes = await fetch('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tasksData = await tasksRes.json();
      setTasks(tasksData);

      // Fetch employees for reassignment options
      const empRes = await fetch('http://localhost:5000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const empData = await empRes.json();
      setEmployees(empData.filter(e => e.status === 'active'));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tasks board.');
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async (taskId) => {
    if (!selectedEmpId) return;
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/reassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employeeId: parseInt(selectedEmpId) })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Reassignment failed');
      }

      setSuccess(data.message);
      setReassigningTaskId(null);
      setSelectedEmpId('');
      fetchTasksAndStaff();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6">
      
      {/* Alert Notices */}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters board */}
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-5 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <h3 className="font-bold text-navy-800 dark:text-white">Task Intelligence Directory</h3>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-navy-400 font-semibold uppercase">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border rounded-xl px-3 py-2 bg-navy-50/50 dark:bg-navy-800 dark:border-navy-700 text-navy-800 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-navy-400 font-semibold uppercase">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs border rounded-xl px-3 py-2 bg-navy-50/50 dark:bg-navy-800 dark:border-navy-700 text-navy-800 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table List */}
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-navy-400 border-b border-navy-100 dark:border-navy-800 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3">Task details</th>
                <th className="pb-3">Project</th>
                <th className="pb-3">Assignee</th>
                <th className="pb-3 text-center">Workload</th>
                <th className="pb-3">Progress</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-150/40 dark:divide-navy-800/40">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-navy-400">No tasks match selected filter.</td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isReassigning = reassigningTaskId === task.id;
                  const hasDeps = task.dependencies && task.dependencies.length > 0;
                  
                  const priorityColors = {
                    high: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400',
                    medium: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
                    low: 'bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-400'
                  };

                  return (
                    <tr key={task.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/20">
                      <td className="py-4 pr-4">
                        <p className="font-bold text-navy-900 dark:text-white leading-tight">{task.name}</p>
                        <p className="text-xs text-navy-400 mt-1 leading-normal max-w-xs truncate">{task.description}</p>
                        <div className="flex gap-2 items-center mt-2.5">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                          {hasDeps && (
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Layers className="h-3 w-3" /> blockable
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 text-xs font-semibold text-navy-500 dark:text-navy-400 truncate max-w-[120px]">
                        {task.project_name}
                      </td>

                      <td className="py-4">
                        {task.assigned_employee_id ? (
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
                              {task.first_name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-xs leading-none">{task.first_name} {task.last_name}</p>
                              <span className="text-[10px] text-navy-400 leading-tight capitalize">{task.job_title}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-rose-500 font-bold italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-4 text-center">
                        <span className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          task.current_workload > 85 
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                            : 'bg-brand-50 text-brand-600 dark:bg-brand-950/20'
                        }`}>
                          {task.current_workload ? `${task.current_workload}%` : '0%'}
                        </span>
                      </td>

                      <td className="py-4 min-w-[120px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-navy-400">
                            <span className="capitalize">{task.status.replace('_', ' ')}</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-24 bg-navy-150 dark:bg-navy-800 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>
                        <span className="text-[10px] text-navy-400 font-semibold block mt-1">Due {task.due_date}</span>
                      </td>

                      <td className="py-4 text-right">
                        {isReassigning ? (
                          <div className="flex items-center gap-2 justify-end bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 p-2 rounded-xl shadow-lg">
                            <select
                              value={selectedEmpId}
                              onChange={(e) => setSelectedEmpId(e.target.value)}
                              className="text-xs font-bold border rounded px-1.5 py-1 bg-navy-50 dark:bg-navy-800 dark:border-navy-700 text-navy-800 dark:text-white"
                            >
                              <option value="">Select Staff</option>
                              {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.first_name} {emp.last_name} ({emp.current_workload}%)
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleReassign(task.id)}
                              disabled={updating}
                              className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setReassigningTaskId(null)}
                              className="p-1 bg-navy-200 text-navy-700 dark:bg-navy-800 dark:text-navy-300 rounded hover:bg-navy-300"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReassigningTaskId(task.id);
                              setSelectedEmpId(task.assigned_employee_id || '');
                            }}
                            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-md shadow-brand-500/10 cursor-pointer inline-flex items-center gap-1"
                          >
                            Reassign <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
