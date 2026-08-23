import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Clock, ShieldAlert, AlertTriangle, 
  ArrowUpRight, FileText, CheckCircle2, TrendingUp, BarChart2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Cell 
} from 'recharts';

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHrData();
  }, []);

  const fetchHrData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load HR Command Center data');
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
        <AlertTriangle />
        <p>Error loading dashboard: {error}</p>
      </div>
    );
  }

  const { kpis, departmentAvailability, workloadDistribution, taskCompletion, activeRisks, pendingRequestsList } = data;

  const availabilityColor = kpis.overallAvailability >= 80 
    ? 'text-emerald-500' 
    : (kpis.overallAvailability >= 70 ? 'text-amber-500' : 'text-rose-500');

  return (
    <div className="space-y-6">
      
      {/* Upper KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-navy-400 text-xs font-semibold uppercase">
            <span>Total Staff</span>
            <Users className="h-4 w-4 text-brand-500" />
          </div>
          <p className="text-2xl font-black text-navy-900 dark:text-white mt-2">{kpis.totalEmployees}</p>
          <span className="text-[10px] text-navy-400">Active profiles registered</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-navy-400 text-xs font-semibold uppercase">
            <span>Present Today</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-navy-900 dark:text-white mt-2">{kpis.present}</p>
          <span className="text-[10px] text-navy-400">Checked-in today</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-navy-400 text-xs font-semibold uppercase">
            <span>On Leave</span>
            <Calendar className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-navy-900 dark:text-white mt-2">{kpis.onLeave}</p>
          <span className="text-[10px] text-navy-400">Approved leave slots</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-navy-400 text-xs font-semibold uppercase">
            <span>Leave Reviews</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-navy-900 dark:text-white mt-2">{kpis.pendingRequests}</p>
          <span className="text-[10px] text-navy-400">Pending HR decision</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center text-navy-400 text-xs font-semibold uppercase">
            <span>Availability</span>
            <TrendingUp className={`h-4 w-4 ${availabilityColor}`} />
          </div>
          <p className={`text-2xl font-black mt-2 ${availabilityColor}`}>{kpis.overallAvailability}%</p>
          <span className="text-[10px] text-navy-400">Target threshold: 70%</span>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Availability Bar Chart */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-base text-navy-800 dark:text-white mb-4">Department Availability (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentAvailability} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-navy-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: document.body.classList.contains('dark') ? '#0f172a' : '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px'
                  }} 
                />
                <Bar dataKey="availability" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={28}>
                  {departmentAvailability.map((entry, idx) => (
                    <Cell key={idx} fill={entry.availability < 70 ? '#ef4444' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Distribution Chart */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-base text-navy-800 dark:text-white mb-4">Workload Distribution (Staff Count)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-navy-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: document.body.classList.contains('dark') ? '#0f172a' : '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px'
                  }} 
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={35}>
                  {workloadDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Main Grid: Pending actions vs Risk Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Pending Requests Table */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm xl:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
            <h3 className="font-bold text-lg text-navy-800 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-500" />
              Incoming Leave Requests
            </h3>
            <span className="bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 text-xs font-bold px-3 py-1 rounded-full">
              {pendingRequestsList.length} Action required
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-navy-400 border-b border-navy-100 dark:border-navy-800 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Leave Range</th>
                  <th className="pb-3 text-center">Workload</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-150/40 dark:divide-navy-800/40">
                {pendingRequestsList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-navy-400">All leave requests processed! No pending items.</td>
                  </tr>
                ) : (
                  pendingRequestsList.map((req) => (
                    <tr key={req.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/20">
                      <td className="py-3.5">
                        <p className="font-bold text-navy-900 dark:text-white">{req.first_name} {req.last_name}</p>
                        <p className="text-xs text-navy-400 capitalize">{req.job_title}</p>
                      </td>
                      <td className="py-3.5 text-xs font-semibold text-navy-500 dark:text-navy-400">{req.department_name}</td>
                      <td className="py-3.5 text-xs">
                        <span className="font-semibold block">{req.start_date}</span>
                        <span className="text-navy-400 text-[10px] block">to {req.end_date}</span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          req.current_workload > 85 
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                            : 'bg-brand-50 text-brand-600 dark:bg-brand-950/20'
                        }`}>
                          {req.current_workload}%
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => navigate(`/hr/leaves?request=${req.id}`)}
                          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all shadow-md shadow-brand-500/10 cursor-pointer inline-flex items-center gap-1"
                        >
                          Analyze Impact <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Radar Sidebar */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
            <h3 className="font-bold text-lg text-navy-800 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
              Risk Radar
            </h3>
            <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Active alerts</span>
          </div>

          <div className="space-y-3">
            {activeRisks.length === 0 ? (
              <div className="py-8 text-center text-navy-400 text-xs">No critical operations risk detected today.</div>
            ) : (
              activeRisks.map((risk) => {
                const isHigh = risk.risk_level === 'HIGH';
                const isMed = risk.risk_level === 'MEDIUM';
                const badgeStyle = isHigh 
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                  : (isMed ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-green-50 text-green-600 dark:bg-green-950/20');
                
                return (
                  <div key={risk.id} className="p-3.5 bg-navy-50/50 dark:bg-navy-800/30 border border-navy-100/50 dark:border-navy-800/30 rounded-2xl space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-navy-400 tracking-wider">{risk.type}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${badgeStyle}`}>
                        {risk.risk_level}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-navy-800 dark:text-navy-100 leading-normal">
                      {risk.description}
                    </p>
                    <span className="text-[10px] text-navy-400 block">{new Date(risk.created_at).toLocaleDateString()}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
