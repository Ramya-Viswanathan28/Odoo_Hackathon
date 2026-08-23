import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, ArrowDown, Award, Sparkles, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Payroll() {
  const { user } = useAuth();
  const [payrollList, setPayrollList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payroll', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payroll history.');
      }
      const data = await response.json();
      setPayrollList(data);
      if (data.length > 0) {
        setSelectedSlip(data[0]); // default select recent slip
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNum - 1] || 'Month';
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
        <DollarSign />
        <p>Error loading payroll: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Grid: List slips vs Slip Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Slips List */}
        <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-lg font-bold text-navy-800 dark:text-white flex items-center gap-2 border-b border-navy-100 dark:border-navy-800 pb-3">
            <DollarSign className="h-5 w-5 text-brand-500" />
            Payslip History
          </h3>
          
          <div className="space-y-2">
            {payrollList.length === 0 ? (
              <p className="text-xs text-navy-400 py-4 text-center">No payslips issued yet.</p>
            ) : (
              payrollList.map((slip) => (
                <button
                  key={slip.id}
                  onClick={() => setSelectedSlip(slip)}
                  className={`w-full p-4 text-left rounded-2xl border transition-all flex justify-between items-center ${
                    selectedSlip?.id === slip.id 
                      ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/15' 
                      : 'border-navy-100 dark:border-navy-800 hover:bg-navy-50/50 dark:hover:bg-navy-800/30'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">{getMonthName(slip.month)} {slip.year}</span>
                    <span className="text-[10px] text-navy-400 uppercase tracking-wider">issued details</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-brand-600 dark:text-brand-400 block">${slip.net_salary.toLocaleString()}</span>
                    <span className="text-[9px] font-bold uppercase text-emerald-500">PAID</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Selected Slip Details */}
        {selectedSlip ? (
          <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Payslip Header */}
            <div className="flex justify-between items-start border-b border-navy-100 dark:border-navy-800 pb-4">
              <div>
                <h3 className="font-black text-xl text-navy-900 dark:text-white tracking-tight">SALARY STATEMENT</h3>
                <p className="text-xs text-navy-400">Statement for: <strong className="text-navy-700 dark:text-navy-300">{getMonthName(selectedSlip.month)} {selectedSlip.year}</strong></p>
              </div>
              <button 
                onClick={() => window.print()}
                className="p-2 border border-navy-200 dark:border-navy-800 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Print Slip
              </button>
            </div>

            {/* Compensation Summary grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-4 bg-navy-50 dark:bg-navy-800/40 rounded-2xl">
                <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Gross Basic Salary</span>
                <p className="text-2xl font-black text-navy-900 dark:text-white mt-2">${selectedSlip.basic_salary.toLocaleString()}</p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/10 rounded-2xl">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Allowances</span>
                <p className="text-2xl font-black text-emerald-500 mt-2">+${selectedSlip.allowances.toLocaleString()}</p>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-950/10 rounded-2xl">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Deductions & Taxes</span>
                <p className="text-2xl font-black text-rose-500 mt-2">-${selectedSlip.deductions.toLocaleString()}</p>
              </div>

            </div>

            {/* Net pay summary card */}
            <div className="p-6 bg-gradient-to-r from-brand-500 to-indigo-600 rounded-2xl text-white flex justify-between items-center shadow-lg shadow-brand-500/15">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-100 uppercase tracking-wider">Total Net Salary Paid</span>
                <p className="text-3xl font-black">${selectedSlip.net_salary.toLocaleString()}</p>
              </div>
              <div className="text-right space-y-1">
                <span className="bg-white/20 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">Transaction complete</span>
                <p className="text-xs text-brand-100 font-mono">Date Issued: {new Date(selectedSlip.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Structured Table Breakdown */}
            <div className="border border-navy-100 dark:border-navy-800 rounded-2xl overflow-hidden">
              <div className="bg-navy-50 dark:bg-navy-800/40 p-4 border-b border-navy-100 dark:border-navy-800 font-bold text-sm">
                Payslip Breakdown & Itemization
              </div>
              <div className="p-4 space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-navy-500">Basic Wage Salary</span>
                  <span className="font-semibold">${selectedSlip.basic_salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-navy-500">Medical Allowance</span>
                  <span className="font-semibold text-emerald-500">+${(selectedSlip.allowances * 0.4).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-navy-500">Travel & Fuel Allowance</span>
                  <span className="font-semibold text-emerald-500">+${(selectedSlip.allowances * 0.6).toLocaleString()}</span>
                </div>
                <hr className="border-navy-100 dark:border-navy-800" />
                <div className="flex justify-between items-center text-rose-500">
                  <span>Professional Tax & Provident Fund Contribution</span>
                  <span className="font-semibold">-${selectedSlip.deductions.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-8 text-center text-navy-400">
            Select a payslip from the list to see detailed statements.
          </div>
        )}
      </div>

    </div>
  );
}
