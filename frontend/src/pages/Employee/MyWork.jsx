import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Clock, ShieldAlert, Award, 
  Play, CheckCircle2, AlertTriangle, Layers, Edit2, Check, X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MyWork() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Task Editing state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks?employeeId=${user.employeeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load assigned tasks.');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditProgress(task.progress);
    setEditStatus(task.status);
    setSuccess('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleUpdateProgress = async (taskId) => {
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          progress: editStatus === 'completed' ? 100 : editProgress,
          status: editStatus
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task.');
      }

      setSuccess('Task progress synchronized with Workforce Twin!');
      setEditingTaskId(null);
      fetchTasks();
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

  // Summary Metrics calculations
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const blocked = tasks.filter(t => t.status === 'blocked').length;

  return (
    <div className="space-y-6">
      
      {/* Messages */}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>{success}</div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 rounded-xl text-rose-700 dark:text-rose-400 text-sm flex gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm text-center">
          <span className="text-xs text-navy-400 font-semibold uppercase tracking-wider block">Total Work</span>
          <span className="text-2xl font-black block mt-2 text-navy-900 dark:text-white">{total}</span>
        </div>
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm text-center">
          <span className="text-xs text-navy-400 font-semibold uppercase tracking-wider block">Completed</span>
          <span className="text-2xl font-black block mt-2 text-emerald-500">{completed}</span>
        </div>
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm text-center">
          <span className="text-xs text-navy-400 font-semibold uppercase tracking-wider block">In Progress</span>
          <span className="text-2xl font-black block mt-2 text-brand-600 dark:text-brand-400">{inProgress}</span>
        </div>
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm text-center">
          <span className="text-xs text-navy-400 font-semibold uppercase tracking-wider block">Pending</span>
          <span className="text-2xl font-black block mt-2 text-navy-500">{pending}</span>
        </div>
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm text-center">
          <span className="text-xs text-navy-400 font-semibold uppercase tracking-wider block">Blocked</span>
          <span className="text-2xl font-black block mt-2 text-rose-500">{blocked}</span>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-navy-800 dark:text-white flex items-center gap-2 border-b border-navy-100 dark:border-navy-800 pb-3">
          <CheckSquare className="h-5 w-5 text-brand-500" />
          My Assigned Deliverables
        </h3>

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-navy-400 text-sm">No tasks assigned to your work calendar.</div>
          ) : (
            tasks.map((task) => {
              const isEditing = editingTaskId === task.id;
              const hasDependencies = task.dependencies && task.dependencies.length > 0;
              
              // status badges
              const statusColors = {
                completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
                in_progress: 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400',
                pending: 'bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-400',
                blocked: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
              };

              return (
                <div key={task.id} className="p-5 bg-navy-50/50 dark:bg-navy-800/20 border border-navy-150/40 dark:border-navy-800/40 rounded-2xl space-y-4">
                  
                  {/* Title and Info */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-navy-900 dark:text-white leading-snug">{task.name}</h4>
                      <p className="text-xs text-navy-400 mt-1 leading-normal">{task.description}</p>
                      <span className="inline-block text-[10px] text-brand-600 dark:text-brand-400 font-bold bg-brand-50/50 dark:bg-brand-950/10 px-2 py-0.5 rounded mt-2.5">
                        📂 {task.project_name}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${statusColors[task.status]}`}>
                        {task.status}
                      </span>
                      <span className="text-[10px] text-navy-400 font-semibold">Priority: <strong className="text-navy-600 dark:text-navy-200 capitalize">{task.priority}</strong></span>
                    </div>
                  </div>

                  {/* Task dependencies visualization */}
                  {hasDependencies && (
                    <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl space-y-1.5">
                      <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        Dependencies (Blockers)
                      </p>
                      {task.dependencies.map((dep, idx) => (
                        <p key={idx} className="text-xs text-navy-500 dark:text-navy-400 flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          Must complete: <strong className="text-navy-700 dark:text-navy-300">"{dep.parent_task_name}"</strong>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Progress block */}
                  <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-navy-150/40 dark:border-navy-800/40">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs text-navy-400">
                        <span>Progress Metric</span>
                        <span className="font-bold text-navy-700 dark:text-navy-300">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-navy-150 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${task.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex justify-between md:justify-end items-center gap-6 shrink-0">
                      <div className="text-xs text-navy-400 text-left md:text-right">
                        <p>Hours: <strong className="text-navy-700 dark:text-navy-300">{task.completed_hours} / {task.estimated_hours}h</strong></p>
                        <p className="text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> Due {task.due_date}
                        </p>
                      </div>

                      {/* Action buttons */}
                      {isEditing ? (
                        <div className="flex items-center gap-3 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-850 p-2.5 rounded-2xl shadow-md">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-navy-400 font-bold uppercase">Status</span>
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="text-xs font-bold border rounded p-1 bg-navy-50 dark:bg-navy-800 dark:border-navy-700"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="blocked">Blocked</option>
                            </select>
                          </div>
                          {editStatus !== 'completed' && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-navy-400 font-bold uppercase">Progress: {editProgress}%</span>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="10"
                                value={editProgress}
                                onChange={(e) => setEditProgress(parseInt(e.target.value))}
                                className="w-20 accent-brand-500"
                              />
                            </div>
                          )}
                          <div className="flex gap-1.5 self-end">
                            <button
                              onClick={() => handleUpdateProgress(task.id)}
                              disabled={updating}
                              className="p-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 bg-navy-200 text-navy-700 dark:bg-navy-800 dark:text-navy-300 rounded-lg hover:bg-navy-300"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(task)}
                          className="bg-white border border-navy-200 hover:bg-navy-100 text-navy-700 dark:bg-navy-800 dark:border-navy-700 dark:hover:bg-navy-700 dark:text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Sync Work
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
