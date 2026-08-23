import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, ShieldAlert, Award, 
  ArrowRight, AlertCircle, CheckCircle2, FileText 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Leaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaveData();
    fetchLeaveTypes();
  }, []);

  const fetchLeaveData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch leaves
      const leavesRes = await fetch('http://localhost:5000/api/leaves', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const leavesData = await leavesRes.json();
      setLeaves(leavesData);

      // Fetch balances from dashboard endpoint for convenience
      const dashboardRes = await fetch('http://localhost:5000/api/employees/me/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dashData = await dashboardRes.json();
      setBalances(dashData.leaveBalances || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load leave history.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      // Create options from balances
      const response = await fetch('http://localhost:5000/api/employees/me/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setLeaveTypes(data.leaveBalances || []);
      if (data.leaveBalances?.length > 0) {
        setForm(prev => ({ ...prev, leaveTypeId: data.leaveBalances[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!form.leaveTypeId || !form.startDate || !form.endDate || !form.reason) {
      setError('Please fill in all fields.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit leave request.');
      }

      setSuccess(`Application submitted! Projected operational impact: ${data.impactScore}. HR has been notified.`);
      setForm({
        leaveTypeId: leaveTypes[0]?.id || '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      fetchLeaveData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
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

      {/* Grid: Apply Form vs Leaves List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-4">Request Leave</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Leave Category</label>
              <select
                name="leaveTypeId"
                value={form.leaveTypeId}
                onChange={handleChange}
                className="block w-full px-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all text-navy-800 dark:text-white"
              >
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id} className="text-navy-900">
                    {type.name} (Bal: {type.remaining} days)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={form.startDate}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all text-navy-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={form.endDate}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all text-navy-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Reason for Absence</label>
              <textarea
                name="reason"
                required
                rows="3"
                placeholder="Brief details..."
                value={form.reason}
                onChange={handleChange}
                className="block w-full px-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all text-navy-800 dark:text-white"
              ></textarea>
            </div>

            {/* Hint for hackathon demo flow */}
            {user?.email === 'arun@dayflow.com' && (
              <div className="p-3 bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/35 rounded-2xl text-[11px] text-navy-500 dark:text-navy-400 leading-normal">
                <span className="font-bold text-brand-600 dark:text-brand-400 block mb-0.5">💡 Hackathon Demo Guideline</span>
                Input <strong className="text-navy-900 dark:text-white">Aug 25, 2026</strong> to <strong className="text-navy-900 dark:text-white">Aug 27, 2026</strong> to trigger the core high-impact leave risk demo scenario.
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-70 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Apply Leave'}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-navy-800 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-500" />
            Leave History Logs
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-navy-400 border-b border-navy-100 dark:border-navy-800 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3">Leave Category</th>
                  <th className="pb-3">Duration Range</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Impact Rating</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-150/40 dark:divide-navy-800/40">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-navy-400">No leaves applied yet.</td>
                  </tr>
                ) : (
                  leaves.map((leave) => {
                    const isHigh = leave.impact_score === 'HIGH';
                    const isMed = leave.impact_score === 'MEDIUM';
                    const impactStyle = isHigh 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                      : (isMed ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400');
                    
                    const isApproved = leave.status === 'approved';
                    const isPending = leave.status === 'pending';
                    const statusStyle = isApproved 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : (isPending ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400');

                    return (
                      <tr key={leave.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/20">
                        <td className="py-3.5 font-bold text-navy-800 dark:text-white">{leave.leave_type_name}</td>
                        <td className="py-3.5 text-xs">
                          <span className="font-semibold block">{leave.start_date}</span>
                          <span className="text-navy-400 text-[10px] block">to {leave.end_date}</span>
                        </td>
                        <td className="py-3.5 text-xs max-w-xs truncate italic">"{leave.reason}"</td>
                        <td className="py-3.5">
                          <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${impactStyle}`}>
                            {leave.impact_score || 'LOW'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${statusStyle}`}>
                            {leave.status}
                          </span>
                          {leave.hr_notes && (
                            <span className="block text-[10px] text-navy-400 italic mt-1 truncate max-w-xs">{leave.hr_notes}</span>
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

    </div>
  );
}
