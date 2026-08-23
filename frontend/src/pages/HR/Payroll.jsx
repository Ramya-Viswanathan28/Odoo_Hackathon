import React, { useState, useEffect } from 'react';
import { 
  DollarSign, FileText, Plus, UserPlus, 
  CheckCircle2, AlertCircle, Edit2, X, ShieldAlert 
} from 'lucide-react';

export default function HRPayroll() {
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update structure Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    basicSalary: '',
    allowances: '',
    deductions: '',
    paymentStatus: 'paid'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch payroll list
      const payRes = await fetch('http://localhost:5000/api/payroll', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!payRes.ok) throw new Error('Failed to load payroll directory');
      const payData = await payRes.json();
      setPayroll(payData);

      // Fetch employees to select
      const empRes = await fetch('http://localhost:5000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!empRes.ok) throw new Error('Failed to load active employee profiles');
      const empData = await empRes.json();
      setEmployees(empData.filter(e => e.status === 'active'));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (emp) => {
    // Check if payroll already exists for this employee for month 7 (July 2026)
    const existing = payroll.find(p => p.employee_id === emp.id && p.month === 7);
    
    setSelectedEmp(emp);
    setSalaryForm({
      basicSalary: existing ? existing.basic_salary : 5000,
      allowances: existing ? existing.allowances : 600,
      deductions: existing ? existing.deductions : 400,
      paymentStatus: existing ? existing.payment_status : 'paid'
    });
    setModalOpen(true);
    setSuccess('');
    setError('');
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          employeeId: selectedEmp.id,
          month: 7, // Default July statements
          year: 2026,
          basicSalary: parseFloat(salaryForm.basicSalary),
          allowances: parseFloat(salaryForm.allowances),
          deductions: parseFloat(salaryForm.deductions),
          paymentStatus: salaryForm.paymentStatus
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Saving failed');

      setSuccess(`Payroll record for ${selectedEmp.first_name} updated successfully! (Net Salary: $${data.netSalary})`);
      setModalOpen(false);
      fetchPayrollData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Calculate summaries
  const totalPayout = payroll.reduce((sum, p) => sum + (p.net_salary || 0), 0);
  const avgNetSalary = payroll.length > 0 ? Math.round(totalPayout / payroll.length) : 0;
  const paidCount = payroll.filter(p => p.payment_status === 'paid').length;
  const pendingCount = employees.length - payroll.length;

  return (
    <div className="space-y-6">
      
      {/* Messages */}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* KPI statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-navy-400 text-xs font-semibold uppercase">
            <span>Total Monthly Payout</span>
            <DollarSign className="h-4 w-4 text-brand-500" />
          </div>
          <p className="text-2xl font-black text-navy-900 dark:text-white mt-2">${totalPayout.toLocaleString()}</p>
          <span className="text-[10px] text-navy-450">Statements for July 2026</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-navy-400 text-xs font-semibold uppercase">
            <span>Average Net Pay</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-navy-900 dark:text-white mt-2">${avgNetSalary.toLocaleString()}</p>
          <span className="text-[10px] text-navy-455">Issued salary average</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-navy-400 text-xs font-semibold uppercase">
            <span>Staff Slips Paid</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-navy-900 dark:text-white mt-2">{paidCount} / {employees.length}</p>
          <span className="text-[10px] text-navy-450">Completed bank deposits</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-navy-400 text-xs font-semibold uppercase">
            <span>Un-issued Slips</span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-navy-900 dark:text-white mt-2">{pendingCount}</p>
          <span className="text-[10px] text-navy-450">Profiles requiring check</span>
        </div>

      </div>

      {/* Directory & Management table */}
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
          <h3 className="text-lg font-bold text-navy-800 dark:text-white">Compensation Directory (July 2026)</h3>
          <span className="text-xs text-navy-400">Total verified staff: {employees.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-navy-400 border-b border-navy-100 dark:border-navy-800 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3">Employee Name</th>
                <th className="pb-3">Basic Wage</th>
                <th className="pb-3">Allowances</th>
                <th className="pb-3">Deductions</th>
                <th className="pb-3">Net Salary</th>
                <th className="pb-3">Payment Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-150/40 dark:divide-navy-800/40 text-xs">
              {employees.map((emp) => {
                const paySlip = payroll.find(p => p.employee_id === emp.id && p.month === 7);
                const isPaid = paySlip?.payment_status === 'paid';
                
                return (
                  <tr key={emp.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/20">
                    <td className="py-3.5">
                      <p className="font-bold text-navy-900 dark:text-white">{emp.first_name} {emp.last_name}</p>
                      <span className="text-[10px] text-navy-400 capitalize">{emp.job_title} &bull; {emp.department_name}</span>
                    </td>
                    
                    <td className="py-3.5 font-mono text-navy-600 dark:text-navy-400">
                      {paySlip ? `$${paySlip.basic_salary.toLocaleString()}` : '—'}
                    </td>
                    
                    <td className="py-3.5 font-mono text-emerald-500 font-semibold">
                      {paySlip ? `+$${paySlip.allowances.toLocaleString()}` : '—'}
                    </td>
                    
                    <td className="py-3.5 font-mono text-rose-500 font-semibold">
                      {paySlip ? `-$${paySlip.deductions.toLocaleString()}` : '—'}
                    </td>
                    
                    <td className="py-3.5 font-mono font-black text-navy-900 dark:text-white">
                      {paySlip ? `$${paySlip.net_salary.toLocaleString()}` : '—'}
                    </td>

                    <td className="py-3.5">
                      {paySlip ? (
                        <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                        }`}>
                          {paySlip.payment_status}
                        </span>
                      ) : (
                        <span className="text-xs text-rose-500 font-bold italic">Not issued</span>
                      )}
                    </td>

                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => openUpdateModal(emp)}
                        className="bg-brand-50 hover:bg-brand-100 text-brand-650 dark:bg-brand-950/20 dark:text-brand-400 font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 border border-brand-100/30"
                      >
                        <Edit2 className="h-3 w-3" /> Adjust Structure
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE STRUCTURE MODAL */}
      {modalOpen && selectedEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl max-w-md w-full shadow-2xl p-6 relative">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-navy-400 hover:text-navy-600 dark:hover:text-white rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800"
            >
              <X className="h-5 w-5" />
            </button>

            <form onSubmit={handleSaveSalary} className="space-y-5">
              <div>
                <h4 className="font-extrabold text-base text-navy-900 dark:text-white">Adjust Salary Structure</h4>
                <p className="text-xs text-navy-450 mt-1">Configure compensation rates for <strong className="text-navy-700 dark:text-navy-300">{selectedEmp.first_name} {selectedEmp.last_name}</strong>.</p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs flex gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-450 uppercase tracking-wider mb-2">Basic Monthly Wage ($)</label>
                  <input
                    type="number"
                    required
                    value={salaryForm.basicSalary}
                    onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: e.target.value })}
                    className="block w-full px-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all text-navy-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-455 uppercase tracking-wider mb-2">Allowances ($)</label>
                    <input
                      type="number"
                      required
                      value={salaryForm.allowances}
                      onChange={(e) => setSalaryForm({ ...salaryForm, allowances: e.target.value })}
                      className="block w-full px-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all text-navy-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-455 uppercase tracking-wider mb-2">Deductions ($)</label>
                    <input
                      type="number"
                      required
                      value={salaryForm.deductions}
                      onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
                      className="block w-full px-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all text-navy-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-450 uppercase tracking-wider mb-2">Transaction status</label>
                  <select
                    value={salaryForm.paymentStatus}
                    onChange={(e) => setSalaryForm({ ...salaryForm, paymentStatus: e.target.value })}
                    className="block w-full px-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all text-navy-800 dark:text-white"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Structure'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-navy-100 hover:bg-navy-200 text-navy-700 dark:bg-navy-800 dark:hover:bg-navy-700 dark:text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
