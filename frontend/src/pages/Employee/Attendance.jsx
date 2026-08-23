import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Attendance() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Today's status helpers
  const [todayRecord, setTodayRecord] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/attendance/me/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load attendance log');
      }
      const data = await response.json();
      setHistory(data);
      
      // Find today's record (mock current date '2026-08-22')
      const today = data.find(log => log.date === '2026-08-22');
      setTodayRecord(today || null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/attendance/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Check-in failed');
      }
      fetchLogs();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/attendance/check-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Check-out failed');
      }
      fetchLogs();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
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
      
      {/* Upper Check-In Panel */}
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold text-navy-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
            <Clock className="h-5 w-5 text-brand-500" />
            Today's Check-in Console
          </h3>
          <p className="text-xs text-navy-400">
            System Mock Date: <strong className="text-navy-700 dark:text-navy-300">August 22, 2026</strong>. Record timestamps below.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          {!todayRecord ? (
            <button 
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-md shadow-brand-500/10 cursor-pointer"
            >
              {actionLoading ? 'Logging...' : 'Sign Check-In (09:00 AM)'}
            </button>
          ) : !todayRecord.check_out_time ? (
            <button 
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="bg-navy-800 hover:bg-navy-950 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-md cursor-pointer dark:bg-navy-700 dark:hover:bg-navy-600"
            >
              {actionLoading ? 'Logging...' : 'Sign Check-Out (05:30 PM)'}
            </button>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-3 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>Shift logged successfully (8.5 hours)</span>
            </div>
          )}
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="font-bold text-lg text-navy-800 dark:text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-500" />
          Recent Attendance History
        </h4>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-navy-400 border-b border-navy-100 dark:border-navy-800 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3">Work Date</th>
                <th className="pb-3">Check-In</th>
                <th className="pb-3">Check-Out</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Duration (Hours)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-150/40 dark:divide-navy-800/40">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-navy-400">No attendance records logged in database.</td>
                </tr>
              ) : (
                history.map((log) => (
                  <tr key={log.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/20">
                    <td className="py-3.5 font-bold text-navy-800 dark:text-white">{log.date}</td>
                    <td className="py-3.5 text-navy-600 dark:text-navy-400 font-mono text-xs">{log.check_in_time || '--:--'}</td>
                    <td className="py-3.5 text-navy-600 dark:text-navy-400 font-mono text-xs">{log.check_out_time || '--:--'}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        log.status === 'present' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : (log.status === 'late' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400')
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-semibold text-navy-700 dark:text-navy-300 font-mono text-xs">
                      {log.working_hours ? `${log.working_hours.toFixed(1)} hrs` : '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
