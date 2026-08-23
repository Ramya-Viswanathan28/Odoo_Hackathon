import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Activity, Brain, 
  Layers, AlertTriangle, ArrowRight, Check, X, Shield 
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="bg-navy-950 text-white min-h-screen font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 px-6 text-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-bold text-brand-300 tracking-wider uppercase animate-pulse-subtle">
            <Sparkles className="h-4 w-4" /> Next-Gen Workforce Intelligence
          </span>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-navy-100 to-brand-400 bg-clip-text text-transparent">
            DAYFLOW
          </h1>
          <p className="text-2xl md:text-3xl font-extrabold text-brand-300 italic tracking-wide">
            "Every workday, perfectly aligned."
          </p>

          <p className="max-w-xl mx-auto text-sm md:text-base text-navy-300 leading-relaxed font-medium">
            An intelligent workforce platform that helps HR understand people, work, and capacity before making critical decisions.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-extrabold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto bg-navy-900 border border-navy-800 hover:bg-navy-800 text-brand-200 font-bold px-8 py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center"
            >
              Explore Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison: Traditional vs Dayflow */}
      <section className="py-16 px-6 max-w-5xl mx-auto border-t border-navy-900">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-12">
          Traditional HRMS vs <span className="text-brand-400">Dayflow</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional HR */}
          <div className="bg-navy-900/40 border border-navy-900 rounded-3xl p-6 md:p-8 space-y-4 opacity-75">
            <h3 className="font-extrabold text-navy-400 text-lg flex items-center gap-2">
              <X className="h-5 w-5 text-rose-500" /> Traditional HRMS
            </h3>
            <ul className="space-y-3.5 text-xs text-navy-300">
              <li className="flex gap-2">
                <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Approves leaves blindly, causing unexpected project blockers.</span>
              </li>
              <li className="flex gap-2">
                <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>No link between employee leaves and sprint tasks.</span>
              </li>
              <li className="flex gap-2">
                <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Ignores workloads, leading to developer burnout or underutilization.</span>
              </li>
              <li className="flex gap-2">
                <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Relies on static reports that fail to show real-time availability.</span>
              </li>
            </ul>
          </div>

          {/* Dayflow */}
          <div className="bg-gradient-to-b from-brand-950/20 to-navy-900/60 border border-brand-500/25 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-brand-400 text-lg flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-500" /> Dayflow Intelligence
            </h3>
            <ul className="space-y-3.5 text-xs text-navy-200">
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Simulates impact before leaves are approved, preserving schedules.</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Connects leave ranges to tasks, dependencies, and active sprints.</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Balances department tasks dynamically to avoid burnout.</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Maintains an interactive Workforce Digital Twin of capacity.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-6 max-w-5xl mx-auto border-t border-navy-900 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">How Dayflow Aligns Work</h2>
          <p className="text-xs text-navy-450 uppercase tracking-widest font-semibold">Core operations engine</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-navy-900/50 border border-navy-900 p-6 rounded-3xl space-y-3 hover:border-brand-500/20 transition-all">
            <span className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl block w-fit">
              <Activity className="h-6 w-6" />
            </span>
            <h4 className="font-extrabold text-base">1. Workforce Digital Twin</h4>
            <p className="text-xs text-navy-400 leading-relaxed">
              Maintains a synchronized capacity index representing employee presence, workloads, and department available capacity.
            </p>
          </div>

          <div className="bg-navy-900/50 border border-navy-900 p-6 rounded-3xl space-y-3 hover:border-brand-500/20 transition-all">
            <span className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl block w-fit">
              <Brain className="h-6 w-6" />
            </span>
            <h4 className="font-extrabold text-base">2. Leave Impact Intelligence</h4>
            <p className="text-xs text-navy-400 leading-relaxed">
              When an employee requests leave, Dayflow maps project milestones, required skills, and availability drops immediately.
            </p>
          </div>

          <div className="bg-navy-900/50 border border-navy-900 p-6 rounded-3xl space-y-3 hover:border-brand-500/20 transition-all">
            <span className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl block w-fit">
              <Sparkles className="h-6 w-6" />
            </span>
            <h4 className="font-extrabold text-base">3. What-If Simulator</h4>
            <p className="text-xs text-navy-400 leading-relaxed">
              HR runs dry-run simulations to evaluate approvals, test reassignments, or check date shift recommendations side-by-side.
            </p>
          </div>

          <div className="bg-navy-900/50 border border-navy-900 p-6 rounded-3xl space-y-3 hover:border-brand-500/20 transition-all">
            <span className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl block w-fit">
              <Layers className="h-6 w-6" />
            </span>
            <h4 className="font-extrabold text-base">4. Task Intelligence</h4>
            <p className="text-xs text-navy-400 leading-relaxed">
              Maintains task dependency structures, tracking blockages and estimating actual remaining workloads for developers.
            </p>
          </div>

          <div className="bg-navy-900/50 border border-navy-900 p-6 rounded-3xl space-y-3 hover:border-brand-500/20 transition-all">
            <span className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl block w-fit">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <h4 className="font-extrabold text-base">5. Workforce Risk Radar</h4>
            <p className="text-xs text-navy-400 leading-relaxed">
              Monitors critical deadlines and flags single points of failure so HR can shadow tasks before capacity conflicts occur.
            </p>
          </div>

          <div className="bg-navy-900/50 border border-navy-900 p-6 rounded-3xl space-y-3 hover:border-brand-500/20 transition-all">
            <span className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl block w-fit">
              <Shield className="h-6 w-6" />
            </span>
            <h4 className="font-extrabold text-base">6. Workforce Passport</h4>
            <p className="text-xs text-navy-400 leading-relaxed">
              Every profile maintains a passport documenting certified skill proficiency levels, workloads, and engagement scores.
            </p>
          </div>

        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center border-t border-navy-900 space-y-6">
        <h3 className="text-3xl font-black">Align Your Team Today.</h3>
        <p className="text-xs text-navy-400 max-w-md mx-auto">
          Start simulating capacity and deliver projects on schedule with Dayflow's AI HRMS platform.
        </p>
        <div className="pt-2">
          <Link 
            to="/signup" 
            className="inline-flex bg-white hover:bg-navy-100 text-navy-950 font-black px-8 py-3.5 rounded-2xl transition-all shadow-xl cursor-pointer"
          >
            Launch Free Trial
          </Link>
        </div>
      </section>

    </div>
  );
}
