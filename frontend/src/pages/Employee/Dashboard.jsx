import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, CheckSquare, Clock, ShieldAlert, Award, 
  ArrowRight, AlertCircle, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees/me/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setAttendanceLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/attendance/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAttendanceLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/attendance/check-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-2xl flex items-center gap-3">
        <AlertCircle />
        <p>Error loading dashboard: {error}</p>
      </div>
    );
  }

  const { attendance, taskSummary, leaveBalances, pendingLeaves, workload, deadlines } = data;

  // Recharts Chart Data
  const chartData = [
    { name: 'Completed', value: taskSummary.completionRate },
    { name: 'Remaining', value: 100 - taskSummary.completionRate }
  ];
  const COLORS = ['#8b5cf6', '#cbd5e1'];
  const DARK_COLORS = ['#8b5cf6', '#334155'];

  return (
    <div className="space-y-6">
      
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 max-w-xl">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Workforce Twin Online</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4">
            Hello, {user?.firstName}!
          </h2>
          <p className="mt-2 text-brand-100 text-sm md:text-base leading-relaxed">
            Your workload is currently at <strong className="text-white">{workload}%</strong>. You have {taskSummary.activeTasks.length} active tasks with {deadlines.length} upcoming deadlines. Keep up the great work!
          </p>
        </div>
      </div>

      {/* Grid: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance Check In Card */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy-800 dark:text-white">Daily Attendance</h3>
            <span className="p-2.5 bg-brand-50 dark:bg-brand-950/20 text-brand-500 rounded-xl">
              <Clock className="h-5 w-5" />
            </span>
          </div>

          <div className="my-2">
            {attendance ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-navy-400">Check In</span>
                  <span className="font-semibold">{attendance.checkIn || '--:--'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-navy-400">Check Out</span>
                  <span className="font-semibold">{attendance.checkOut || '--:--'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-navy-400">Total Hours</span>
                  <span className="font-semibold">{attendance.workingHours ? `${attendance.workingHours.toFixed(1)} hrs` : '--'}</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 mt-2 text-xs font-bold rounded-full ${
                  attendance.status === 'present' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                }`}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {attendance.status}
                </span>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-navy-400 mb-1">No attendance logged for today.</p>
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">Current Mock Date: Aug 22, 2026</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            {!attendance ? (
              <button 
                onClick={handleCheckIn}
                disabled={attendanceLoading}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/10 cursor-pointer text-center"
              >
                {attendanceLoading ? 'Checking In...' : 'Check In'}
              </button>
            ) : !attendance.checkOut ? (
              <button 
                onClick={handleCheckOut}
                disabled={attendanceLoading}
                className="flex-1 bg-navy-800 hover:bg-navy-950 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-center dark:bg-navy-700 dark:hover:bg-navy-600"
              >
                {attendanceLoading ? 'Checking Out...' : 'Check Out'}
              </button>
            ) : (
              <div className="w-full text-center py-2 bg-navy-50 dark:bg-navy-800/40 rounded-xl text-navy-400 text-xs font-bold">
                Shift Completed
              </div>
            )}
          </div>
        </div>

        {/* Work Completion Pie Card */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-navy-800 dark:text-white">Work Progress</h3>
              <p className="text-xs text-navy-400">Total assigned tasks progress</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-brand-600 dark:text-brand-400">{taskSummary.completionRate}%</p>
              <p className="text-xs text-navy-400">{taskSummary.completed} of {taskSummary.total} tasks complete</p>
            </div>
          </div>

          <div className="h-28 w-28 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#8b5cf6" />
                  <Cell fill={document.body.classList.contains('dark') ? '#334155' : '#e2e8f0'} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <CheckSquare className="h-5 w-5 text-brand-500" />
            </div>
          </div>
        </div>

        {/* Workload Indicator Card */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy-800 dark:text-white">Active Workload</h3>
              <span className={`p-1.5 rounded-lg text-xs font-bold ${
                workload > 85 
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
              }`}>
                {workload > 85 ? 'High Load' : 'Balanced'}
              </span>
            </div>
            <p className="text-2xl font-black text-navy-900 dark:text-white mb-2">{workload}%</p>
            <div className="w-full bg-navy-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  workload > 85 ? 'bg-rose-500' : 'bg-brand-500'
                }`}
                style={{ width: `${workload}%` }}
              ></div>
            </div>
          </div>
          <p className="text-[11px] text-navy-400 mt-4 leading-relaxed">
            {workload > 85 
              ? 'Warning: High workload might affect capacity and leaves.' 
              : 'Workload is within healthy operational range.'}
          </p>
        </div>

      </div>

      {/* Leave Balance Row */}
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-lg text-navy-800 dark:text-white mb-4">Leave Balances</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {leaveBalances.map((lb) => (
            <div key={lb.id} className="p-4 bg-navy-50 dark:bg-navy-800/40 border border-navy-100 dark:border-navy-800/50 rounded-2xl">
              <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">{lb.name}</p>
              <div className="flex justify-between items-end mt-3">
                <span className="text-3xl font-black text-navy-900 dark:text-white leading-none">{lb.remaining}</span>
                <span className="text-xs text-navy-400">/ {lb.total} days remaining</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Tasks & Deadlines / Pending leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Tasks & Deadlines */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
            <h3 className="font-bold text-lg text-navy-800 dark:text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-brand-500" />
              Active Tasks
            </h3>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{taskSummary.activeTasks.length} in-progress</span>
          </div>

          <div className="space-y-3.5">
            {taskSummary.activeTasks.length === 0 ? (
              <div className="py-8 text-center text-navy-400 text-sm">No active tasks assigned.</div>
            ) : (
              taskSummary.activeTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="group p-4 bg-navy-50/50 dark:bg-navy-800/20 border border-navy-100/50 dark:border-navy-800/30 rounded-2xl space-y-3 hover:border-brand-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-navy-800 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-tight">
                      {task.name}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      task.priority === 'high' 
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-navy-400">
                      <span>Progress</span>
                      <span className="font-semibold text-navy-700 dark:text-navy-300">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-navy-150 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-navy-400 pt-1 border-t border-navy-100/30 dark:border-navy-800/30">
                    <span>Estimate: {task.estimated_hours} hrs</span>
                    <span className="font-semibold text-rose-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Due {task.due_date}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leave Requests & Deadlines overview */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
              <h3 className="font-bold text-lg text-navy-800 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-500" />
                Pending Leaves
              </h3>
              <span className="text-xs text-navy-400">{pendingLeaves.length} pending review</span>
            </div>

            <div className="space-y-3">
              {pendingLeaves.length === 0 ? (
                <div className="py-6 text-center text-navy-400 text-sm">No pending leave requests.</div>
              ) : (
                pendingLeaves.map((leave) => (
                  <div key={leave.id} className="p-4 bg-navy-50/50 dark:bg-navy-800/20 border border-navy-100/50 dark:border-navy-800/30 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{leave.leave_type_name}</p>
                      <p className="text-xs text-navy-400 mt-0.5">{leave.start_date} to {leave.end_date}</p>
                      <p className="text-xs text-navy-400 truncate max-w-xs mt-1.5 italic">"{leave.reason}"</p>
                    </div>
                    <span className="text-[10px] font-extrabold tracking-wider bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 px-3 py-1 rounded-full uppercase">
                      PENDING
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-navy-100 dark:border-navy-800 mt-6 flex justify-between items-center">
            <p className="text-xs text-navy-400">Plan your holidays and check project dependencies beforehand.</p>
            <a href="/leaves" className="text-xs text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1 hover:underline">
              Apply Leave <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
