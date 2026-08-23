import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Phone, Calendar, Briefcase, Award, 
  Activity, CheckCircle2, Shield, Edit2, Check, AlertCircle 
} from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user?.employeeId) {
      fetchPassport();
    }
  }, [user]);

  const fetchPassport = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${user.employeeId}/passport`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch passport details');
      }
      const data = await response.json();
      setPassportData(data);
      setPhone(data.profile.phone || '');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/employees/${user.employeeId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ phone })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }
      
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      fetchPassport();
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

  if (error || !passportData) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-2xl flex items-center gap-3">
        <AlertCircle />
        <p>Error loading profile: {error || 'No profile data found.'}</p>
      </div>
    );
  }

  const { profile, metrics, skills, activeTasks, leaveBalances } = passportData;

  return (
    <div className="space-y-6">
      
      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid structure: Main details card & Passport details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card & Info Editor */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-6 h-fit">
          <div className="text-center relative">
            <img 
              src={profile.avatarUrl} 
              alt="Avatar" 
              className="h-28 w-28 rounded-full border-2 border-brand-500 mx-auto bg-navy-50"
            />
            <h3 className="text-xl font-bold text-navy-900 dark:text-white mt-4">{profile.firstName} {profile.lastName}</h3>
            <p className="text-xs text-navy-400 font-semibold capitalize mt-1">{profile.jobTitle}</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 mt-2.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
              <Check className="h-3 w-3" /> Active Employee
            </span>
          </div>

          <hr className="border-navy-100 dark:border-navy-800" />

          {/* Details list */}
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-navy-400 shrink-0" />
              <div className="truncate">
                <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Email</p>
                <p className="font-semibold text-navy-800 dark:text-white truncate">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-navy-400 shrink-0" />
              <div className="w-full">
                <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Phone</p>
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="flex gap-2 mt-1">
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full px-2 py-1 text-xs border rounded bg-navy-50 dark:bg-navy-800 dark:border-navy-700"
                    />
                    <button type="submit" disabled={updating} className="p-1 bg-brand-500 hover:bg-brand-600 text-white rounded">
                      <Check className="h-3 w-3" />
                    </button>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-navy-800 dark:text-white">{profile.phone || 'Not provided'}</span>
                    <button onClick={() => setIsEditing(true)} className="text-navy-400 hover:text-brand-500">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-navy-400 shrink-0" />
              <div>
                <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Department</p>
                <p className="font-semibold text-navy-800 dark:text-white">{profile.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-navy-400 shrink-0" />
              <div>
                <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Hire Date</p>
                <p className="font-semibold text-navy-800 dark:text-white">{profile.hireDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workforce Passport Visual Twin Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Workforce Passport Shield Header */}
          <div className="bg-gradient-to-r from-violet-600 to-brand-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h3 className="font-black text-xl flex items-center gap-2 tracking-tight">
                <Shield className="h-6 w-6 text-brand-200" />
                WORKFORCE PASSPORT
              </h3>
              <p className="text-brand-100 text-xs">Official capacity, skills and engagement indicators log.</p>
            </div>
            <span className="bg-white/20 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg">
              PASSPORT ID: DF-{profile.id}098
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-navy-400 text-xs font-semibold uppercase tracking-wider">Attendance</p>
              <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-2">{metrics.attendanceRate}%</p>
              <span className="text-[10px] text-navy-400">Monthly check-in rate</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-navy-400 text-xs font-semibold uppercase tracking-wider">Punctuality</p>
              <p className="text-2xl font-black text-emerald-500 mt-2">{metrics.punctualityRate}%</p>
              <span className="text-[10px] text-navy-400">On-time check-in rate</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-navy-400 text-xs font-semibold uppercase tracking-wider">Workload</p>
              <p className={`text-2xl font-black mt-2 ${metrics.workload > 85 ? 'text-rose-500' : 'text-brand-600 dark:text-brand-400'}`}>
                {metrics.workload}%
              </p>
              <span className="text-[10px] text-navy-400">Active tasks capacity</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-navy-400 text-xs font-semibold uppercase tracking-wider">Task Completion</p>
              <p className="text-2xl font-black text-indigo-500 mt-2">{metrics.completedTasks}</p>
              <span className="text-[10px] text-navy-400">Completed tasks count</span>
            </div>

          </div>

          {/* Leave remaining progress bars */}
          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-navy-800 dark:text-white mb-4">Leave Allowances Remaining</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leaveBalances.map((lb, idx) => {
                const pct = Math.max(0, Math.min(100, Math.round((lb.remaining / lb.total) * 100)));
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-navy-700 dark:text-navy-300">{lb.name}</span>
                      <span className="text-navy-500">{lb.remaining} / {lb.total} days</span>
                    </div>
                    <div className="w-full bg-navy-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills Mapping & Proficiency */}
          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-navy-800 dark:text-white flex items-center gap-2 border-b border-navy-100 dark:border-navy-800 pb-3">
              <Award className="h-5 w-5 text-brand-500" />
              Verified Work Skills
            </h4>
            {skills.length === 0 ? (
              <p className="text-xs text-navy-400">No skills registered on passport.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.map((skill, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-navy-50/50 dark:bg-navy-800/30 border border-navy-100/50 dark:border-navy-800/30 rounded-2xl">
                    <div>
                      <span className="font-bold text-sm block text-navy-800 dark:text-white">{skill.name}</span>
                      <span className="text-[10px] text-navy-400 uppercase tracking-wider">{skill.category}</span>
                    </div>
                    
                    {/* Stars / Proficiency scale representation */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          className={`text-xs ${star <= skill.proficiency_level ? 'text-amber-400' : 'text-navy-200 dark:text-navy-800'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Active Tasks List */}
          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-navy-800 dark:text-white flex items-center gap-2 border-b border-navy-100 dark:border-navy-800 pb-3">
              <Activity className="h-5 w-5 text-brand-500" />
              Active Project Deadlines
            </h4>
            
            <div className="space-y-3">
              {activeTasks.length === 0 ? (
                <p className="text-xs text-navy-400 text-center py-6">All tasks completed! Your desk is clear.</p>
              ) : (
                activeTasks.map((task) => (
                  <div key={task.id} className="p-4 bg-navy-50/50 dark:bg-navy-800/20 border border-navy-150/40 dark:border-navy-800/40 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-navy-800 dark:text-white">{task.name}</p>
                      <span className="text-[10px] text-navy-400 font-semibold">{task.project_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-rose-500 block">Due {task.due_date}</span>
                      <span className="text-[10px] text-navy-400">Progress: {task.progress}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
