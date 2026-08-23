import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, ShieldAlert, AlertTriangle, 
  Search, Shield, CheckCircle2, ChevronRight, X, Mail, Phone, Award, Activity 
} from 'lucide-react';

export default function DigitalTwin() {
  const [twinData, setTwinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive Passport Modal state
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [passport, setPassport] = useState(null);
  const [passportLoading, setPassportLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTwinData();
  }, []);

  const fetchTwinData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/digital-twin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch workforce twin logs');
      }
      const data = await response.json();
      setTwinData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPassport = async (empId) => {
    setSelectedEmpId(empId);
    setPassportLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${empId}/passport`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPassport(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPassportLoading(false);
    }
  };

  const handleClosePassport = () => {
    setSelectedEmpId(null);
    setPassport(null);
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
      <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3">
        <AlertTriangle />
        <p>Error loading workforce twin: {error}</p>
      </div>
    );
  }

  const { liveStaff, deptCapacity, deadlines, risks } = twinData;

  // Filter staff list
  const filteredStaff = liveStaff.filter(staff => {
    const matchSearch = (staff.first_name + ' ' + staff.last_name).toLowerCase().includes(searchTerm.toLowerCase()) || staff.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter === 'all' || staff.department_name === deptFilter;
    const matchStatus = statusFilter === 'all' || staff.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Upper overview header */}
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-navy-800 dark:text-white">Organization State Monitor</h3>
          <p className="text-xs text-navy-400">Live operational view of department capacities, workloads, and employee presence.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Synchronized Live</span>
        </div>
      </div>

      {/* Grid: Department availability rings / widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {deptCapacity.map((dept) => {
          const availColor = dept.availability >= 85 
            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
            : (dept.availability >= 70 ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'text-rose-500 bg-rose-50 dark:bg-rose-950/20');
          
          return (
            <div key={dept.id} className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block truncate">{dept.name}</span>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-2xl font-black text-navy-900 dark:text-white block">{dept.present} / {dept.total}</span>
                  <span className="text-[10px] text-navy-400">Available staffing</span>
                </div>
                <span className={`text-xs font-black px-2 py-1 rounded-lg ${availColor}`}>
                  {dept.availability}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Interactive Directory with Search & Filters */}
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center pb-4 border-b border-navy-100 dark:border-navy-800">
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-navy-400 pointer-events-none">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search staff or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-xs transition-all"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="flex-1 md:flex-none text-xs border rounded-xl px-3 py-2 bg-navy-50/50 dark:bg-navy-800 dark:border-navy-700 text-navy-800 dark:text-white"
            >
              <option value="all">All Departments</option>
              {deptCapacity.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:flex-none text-xs border rounded-xl px-3 py-2 bg-navy-50/50 dark:bg-navy-800 dark:border-navy-700 text-navy-800 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="on_leave">On Leave</option>
              <option value="absent">Offline / Absent</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStaff.length === 0 ? (
            <div className="col-span-full py-12 text-center text-navy-400 text-xs">No employees found.</div>
          ) : (
            filteredStaff.map((staff) => {
              const isHighWorkload = staff.current_workload > 85;
              const isMedWorkload = staff.current_workload >= 50 && staff.current_workload <= 85;
              const workloadColor = isHighWorkload 
                ? 'bg-rose-500' 
                : (isMedWorkload ? 'bg-amber-500' : 'bg-emerald-500');

              const statusColor = staff.status === 'present' 
                ? 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-950/40' 
                : (staff.status === 'on_leave' ? 'bg-amber-500 ring-amber-100 dark:ring-amber-950/40' : 'bg-navy-300 ring-navy-100 dark:ring-navy-800/40');

              return (
                <div 
                  key={staff.id} 
                  onClick={() => handleOpenPassport(staff.id)}
                  className="p-4 bg-navy-50/40 dark:bg-navy-800/20 border border-navy-150/40 dark:border-navy-800/40 rounded-2xl hover:border-brand-500/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="relative">
                      <img 
                        src={staff.avatar_url} 
                        alt="avatar" 
                        className="h-11 w-11 rounded-full border border-navy-200 dark:border-navy-700 bg-navy-100"
                      />
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-navy-900 ring-2 ${statusColor}`}></span>
                    </div>

                    <span className="text-[10px] text-navy-400 font-bold group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex items-center gap-0.5">
                      Passport <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-sm text-navy-800 dark:text-white leading-tight">{staff.first_name} {staff.last_name}</p>
                    <p className="text-[11px] text-navy-400 truncate leading-snug">{staff.job_title}</p>
                    <p className="text-[9px] font-semibold text-navy-400 uppercase tracking-wide leading-none">{staff.department_name}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-navy-150/45 dark:border-navy-800/45 flex justify-between items-center text-[10px]">
                    <div className="flex-1 mr-3 space-y-1">
                      <div className="flex justify-between text-navy-400">
                        <span>Workload</span>
                        <span className="font-bold text-navy-700 dark:text-navy-300">{staff.current_workload}%</span>
                      </div>
                      <div className="w-full bg-navy-200 dark:bg-navy-800 h-1 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${workloadColor}`} style={{ width: `${staff.current_workload}%` }}></div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-navy-700 dark:text-navy-300">{staff.activeTasks}</span>
                      <span className="text-navy-400 block">tasks</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Passport Modal Detail */}
      {selectedEmpId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative">
            <button 
              onClick={handleClosePassport} 
              className="absolute top-4 right-4 p-2 text-navy-400 hover:text-navy-600 dark:hover:text-white rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800"
            >
              <X className="h-5 w-5" />
            </button>

            {passportLoading || !passport ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-brand-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={passport.profile.avatarUrl} 
                      alt="avatar" 
                      className="h-14 w-14 rounded-full border border-white/20 bg-navy-50"
                    />
                    <div>
                      <h4 className="font-black text-lg leading-tight">{passport.profile.firstName} {passport.profile.lastName}</h4>
                      <p className="text-xs text-brand-100 mt-0.5">{passport.profile.jobTitle} &bull; {passport.profile.department}</p>
                    </div>
                  </div>
                  <span className="bg-white/20 text-white font-mono text-[9px] font-bold px-2 py-1 rounded">
                    PASSPORT ID: DF-{passport.profile.id}098
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-navy-50/50 dark:bg-navy-800/40 rounded-xl">
                    <span className="text-[10px] text-navy-400 uppercase tracking-wider block">Attendance</span>
                    <span className="text-lg font-black text-brand-600 dark:text-brand-400 block mt-1">{passport.metrics.attendanceRate}%</span>
                  </div>
                  <div className="p-3 bg-navy-50/50 dark:bg-navy-800/40 rounded-xl">
                    <span className="text-[10px] text-navy-400 uppercase tracking-wider block">Punctuality</span>
                    <span className="text-lg font-black text-emerald-500 block mt-1">{passport.metrics.punctualityRate}%</span>
                  </div>
                  <div className="p-3 bg-navy-50/50 dark:bg-navy-800/40 rounded-xl">
                    <span className="text-[10px] text-navy-400 uppercase tracking-wider block">Workload</span>
                    <span className={`text-lg font-black block mt-1 ${passport.metrics.workload > 85 ? 'text-rose-500' : 'text-brand-600 dark:text-brand-400'}`}>
                      {passport.metrics.workload}%
                    </span>
                  </div>
                  <div className="p-3 bg-navy-50/50 dark:bg-navy-800/40 rounded-xl">
                    <span className="text-[10px] text-navy-400 uppercase tracking-wider block">Active Tasks</span>
                    <span className="text-lg font-black text-navy-700 dark:text-navy-300 block mt-1">{passport.metrics.activeTasksCount}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-navy-400 uppercase tracking-wider">Verified Skills Matrix</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {passport.skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-navy-50 dark:bg-navy-800 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                        {s.name}
                        <span className="text-[9px] text-amber-500">★ {s.proficiency_level}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact and Hire Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs p-4 bg-navy-50/30 dark:bg-navy-850/15 border border-navy-150/40 dark:border-navy-800/45 rounded-xl">
                  <div className="flex gap-2.5">
                    <Mail className="h-4 w-4 text-navy-400 shrink-0" />
                    <div>
                      <p className="text-navy-400">Email Address</p>
                      <p className="font-bold mt-0.5 text-navy-800 dark:text-navy-200">{passport.profile.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <Phone className="h-4 w-4 text-navy-400 shrink-0" />
                    <div>
                      <p className="text-navy-400">Phone</p>
                      <p className="font-bold mt-0.5 text-navy-800 dark:text-navy-200">{passport.profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Active Deliverables */}
                <div className="space-y-3">
                  <h5 className="font-bold text-xs text-navy-400 uppercase tracking-wider">Active Deliverables</h5>
                  {passport.activeTasks.length === 0 ? (
                    <p className="text-xs text-navy-400 italic">No active task deliverables found.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {passport.activeTasks.map((t, idx) => (
                        <div key={idx} className="p-3 bg-navy-50/50 dark:bg-navy-850/20 border border-navy-150/35 dark:border-navy-800/35 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-navy-800 dark:text-navy-100">{t.name}</p>
                            <span className="text-[10px] text-navy-400 block mt-0.5">📂 {t.project_name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-rose-500 font-bold block">Due {t.due_date}</span>
                            <span className="text-[10px] text-navy-400 font-semibold">{t.progress}% complete</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
