import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, ArrowRight, User, Mail, Lock, Check } from 'lucide-react';

export default function SignUp() {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'employee'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyData, setVerifyData] = useState(null); // hold simulated link

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setVerifyData(null);

    const { firstName, lastName, email, password, role } = formData;

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const data = await register(formData);
      setVerifyData({
        message: data.message,
        link: data.verificationLink,
        token: data.verificationToken
      });
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'employee'
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed. Try using a unique email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl shadow-xl border border-navy-200 dark:border-navy-800 p-8 glow-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-brand-500 text-white font-bold text-2xl shadow-lg shadow-brand-500/20 mb-4">
            ⚡
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white font-sans">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">
            Claim or create your Dayflow profile.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 rounded-xl text-rose-700 dark:text-rose-400 text-sm flex gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Simulation success notice */}
        {verifyData && (
          <div className="mb-6 p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl text-emerald-800 dark:text-emerald-400 text-sm space-y-3">
            <div className="flex gap-2.5 font-bold items-center text-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <span>Email Verification Simulated!</span>
            </div>
            <p className="text-xs text-navy-500 dark:text-navy-400 leading-normal">
              A verification token has been generated. To proceed, click the verification button below.
            </p>
            <a 
              href={verifyData.link} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              Verify Simulated Email <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Arun"
                className="block w-full px-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Kumar"
                className="block w-full px-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-navy-400 pointer-events-none">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="arun@dayflow.com"
                className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-navy-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Role Type</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'employee' })}
                className={`py-2 px-4 rounded-xl border font-medium text-xs transition-all ${
                  formData.role === 'employee'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 font-bold'
                    : 'border-navy-300 dark:border-navy-700 text-navy-500 hover:bg-navy-50 dark:hover:bg-navy-800'
                }`}
              >
                Employee / Developer
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'hr' })}
                className={`py-2 px-4 rounded-xl border font-medium text-xs transition-all ${
                  formData.role === 'hr'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold'
                    : 'border-navy-300 dark:border-navy-700 text-navy-500 hover:bg-navy-50 dark:hover:bg-navy-800'
                }`}
              >
                HR Administrator
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-70 mt-6 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Register'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400">
          Already registered?{' '}
          <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
