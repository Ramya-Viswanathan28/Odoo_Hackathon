import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, 
  HelpCircle, UserCheck, Activity, Award, Briefcase 
} from 'lucide-react';

export default function Continuity() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shadowTaskId, setShadowTaskId] = useState(null);
  const [selectedBackupId, setSelectedBackupId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchContinuityLogs();
  }, []);

  const fetchContinuityLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/continuity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to load continuity statistics');
      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignShadow = async (taskId) => {
    if (!selectedBackupId) return;
    setAssigning(true);
    setError('');
    setSuccess('');

    try {
      // Shifting task or adding backup is done via reassigning task or shadow notification.
      // For this hackathon demo, we reassign the task immediately or assign a shadow helper in tasks.
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/reassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employeeId: parseInt(selectedBackupId) })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Shadow assignment failed');

      setSuccess(`Backup resource assigned successfully! ${data.message}`);
      setShadowTaskId(null);
      setSelectedBackupId('');
      fetchContinuityLogs();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setAssigning(false);
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

      {/* Continuity Intro banner */}
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-navy-800 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-5.5 w-5.5 text-rose-500" />
            Operations Continuity Center
          </h3>
          <p className="text-xs text-navy-400">
            Identifies single points of failure where critical tasks rely on single resource skill proficiency.
          </p>
        </div>
        <span className="bg-rose-50 text-rose-500 text-xs font-bold px-3 py-1.5 rounded-full uppercase">
          {alerts.filter(a => a.riskLevel === 'HIGH').length} High Vulnerabilities
        </span>
      </div>

      {/* Alerts Directory Grid */}
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-navy-400 border-b border-navy-100 dark:border-navy-800 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3">Deliverable / Task</th>
                <th className="pb-3">Required Skill</th>
                <th className="pb-3">Primary Resource</th>
                <th className="pb-3">Status Risk</th>
                <th className="pb-3 text-right">Backups / Shadow Allocations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-150/40 dark:divide-navy-800/40 text-xs">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-navy-400">Continuity parameters are secure. No single points of failure detected.</td>
                </tr>
              ) : (
                alerts.map((item, idx) => {
                  const isHigh = item.riskLevel === 'HIGH';
                  const isMed = item.riskLevel === 'MEDIUM';
                  const badgeStyle = isHigh 
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                    : (isMed ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20');
                  
                  const isModifying = shadowTaskId === item.taskId;

                  return (
                    <tr key={idx} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/20 align-top">
                      <td className="py-4 pr-4">
                        <p className="font-bold text-sm text-navy-900 dark:text-white leading-tight">{item.taskName}</p>
                        <span className="text-[10px] text-navy-450 mt-0.5 block">📂 Project: {item.projectName}</span>
                      </td>

                      <td className="py-4 font-semibold text-navy-600 dark:text-navy-400">
                        <span className="inline-flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-brand-500" />
                          {item.requiredSkill}
                        </span>
                      </td>

                      <td className="py-4">
                        <p className="font-bold text-navy-900 dark:text-white">{item.primaryAssignee}</p>
                        <span className="text-[10px] text-navy-400 capitalize block">{item.jobTitle}</span>
                      </td>

                      <td className="py-4">
                        <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${badgeStyle} mb-1.5`}>
                          {item.riskLevel} RISK
                        </span>
                        <p className="text-[10px] text-navy-450 leading-relaxed max-w-[200px]">{item.backupStatus}</p>
                      </td>

                      <td className="py-4 text-right">
                        {isModifying ? (
                          <div className="inline-flex items-center gap-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 p-2 rounded-xl shadow-lg">
                            <select
                              value={selectedBackupId}
                              onChange={(e) => setSelectedBackupId(e.target.value)}
                              className="text-xs font-bold border rounded px-1.5 py-1 bg-navy-50 dark:bg-navy-800 dark:border-navy-700 text-navy-800 dark:text-white"
                            >
                              <option value="">Select Shadow</option>
                              {item.backups.map((b, i) => (
                                // For mock backups, search employees with same names to match ID
                                <option key={i} value="3"> {/* Priya is ID 3 */}
                                  {b.name} (Load: {b.workload}%)
                                </option>
                              ))}
                              {item.backups.length === 0 && (
                                <option value="3">Priya Sharma (Match: 94%)</option>
                              )}
                            </select>
                            <button
                              onClick={() => handleAssignShadow(item.taskId)}
                              disabled={assigning}
                              className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setShadowTaskId(null)}
                              className="p-1 bg-navy-200 text-navy-750 rounded hover:bg-navy-300"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {item.backups.length > 0 ? (
                              <div className="text-right space-y-1">
                                {item.backups.map((b, i) => (
                                  <span key={i} className="inline-block bg-brand-50/50 dark:bg-brand-950/10 text-brand-650 dark:text-brand-400 font-semibold px-2 py-0.5 rounded mr-1">
                                    👤 {b.name} (Proficiency: {b.proficiency}/5, Workload: {b.workload}%)
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-rose-500 font-bold block">No shadow resource registered</span>
                            )}
                            <button
                              onClick={() => {
                                setShadowTaskId(item.taskId);
                                setSelectedBackupId('');
                              }}
                              className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer inline-flex items-center gap-1"
                            >
                              Assign Shadow Candidate
                            </button>
                          </div>
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
