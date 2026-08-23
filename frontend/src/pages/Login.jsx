import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      // Role-based routing redirection
      if (user.role === 'hr') {
        navigate('/hr/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl shadow-xl border border-navy-200 dark:border-navy-800 p-8 glow-card">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-brand-500 text-white font-bold text-2xl shadow-lg shadow-brand-500/20 mb-4 animate-float">
            ⚡
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white font-sans">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">
            Sign in to manage your capacity and projects.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 rounded-xl text-rose-700 dark:text-rose-400 text-sm flex gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-navy-400 pointer-events-none">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@dayflow.com"
                className="block w-full pl-11 pr-4 py-3 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-navy-400 pointer-events-none">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-11 pr-4 py-3 rounded-xl border border-navy-300 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          {/* Seed accounts quick links for hackathon evaluation */}
          <div className="pt-2">
            <div className="p-3 bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900/30 rounded-xl text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed">
              <span className="font-semibold text-brand-600 dark:text-brand-400 uppercase block mb-1">Demo Accounts (Password: password123)</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1 font-mono">
                <button 
                  type="button" 
                  onClick={() => { setEmail('arun@dayflow.com'); setPassword('password123'); }}
                  className="text-left hover:underline text-brand-600 dark:text-brand-400"
                >
                  👤 Arun (Dev)
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('hr@dayflow.com'); setPassword('password123'); }}
                  className="text-left hover:underline text-emerald-600 dark:text-emerald-400"
                >
                  💼 Sarah (HR)
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('priya@dayflow.com'); setPassword('password123'); }}
                  className="text-left hover:underline text-brand-600 dark:text-brand-400"
                >
                  👤 Priya (Dev)
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('rahul@dayflow.com'); setPassword('password123'); }}
                  className="text-left hover:underline text-brand-600 dark:text-brand-400"
                >
                  👤 Rahul (Lead)
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-70 mt-4 cursor-pointer"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
            Register Profile
          </Link>
        </p>
      </div>
    </div>
  );
}
