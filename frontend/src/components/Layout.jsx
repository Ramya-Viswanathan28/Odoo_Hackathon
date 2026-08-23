import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Users, Calendar, CheckSquare, DollarSign, Bell, LogOut, 
  Menu, X, User, ShieldAlert, BarChart2, Activity, Sun, Moon, Briefcase
} from 'lucide-react';

// Theme helper
const toggleDarkMode = () => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

const initTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
};

// --- PUBLIC LAYOUT ---
export const PublicLayout = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-navy-50 dark:bg-navy-950 transition-colors duration-300">
      <header className="sticky top-0 z-50 glass-panel border-b border-navy-200 dark:border-navy-900 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-brand-600 dark:text-brand-400 font-sans tracking-tight">
          <span className="bg-brand-600 dark:bg-brand-500 text-white p-1.5 rounded-lg flex items-center justify-center animate-pulse-subtle">⚡</span>
          Dayflow
        </Link>
        <nav className="flex items-center gap-6">
          <button onClick={toggleDarkMode} className="p-2 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-800 rounded-lg">
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
          </button>
          {user ? (
            <Link 
              to={user.role === 'hr' ? '/hr/dashboard' : '/dashboard'} 
              className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-xl transition-all shadow-md shadow-brand-500/20"
            >
              Go to App
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-navy-600 dark:text-navy-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium">
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-xl transition-all shadow-md shadow-brand-500/20"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-8 text-center text-navy-400 border-t border-navy-200 dark:border-navy-900 bg-white dark:bg-navy-950">
        <p>&copy; {new Date().getFullYear()} Dayflow. All rights reserved. Hackathon 2026 Submission.</p>
      </footer>
    </div>
  );
};

// --- APP LAYOUT (BASE FOR SIDEBAR PANELS) ---
const DashboardLayout = ({ role, navLinks }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    initTheme();
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`http://localhost:5000/api/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-navy-50 dark:bg-navy-950 text-navy-900 dark:text-navy-100 transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-navy-900 border-r border-navy-200 dark:border-navy-800 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between`}>
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center justify-between border-b border-navy-200 dark:border-navy-800">
            <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-brand-600 dark:text-brand-400">
              <span className="bg-brand-600 dark:bg-brand-500 text-white p-1 rounded-lg flex items-center justify-center">⚡</span>
              Dayflow
            </Link>
            <button className="lg:hidden p-1 rounded hover:bg-navy-100 dark:hover:bg-navy-800" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
                      : 'text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-navy-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile footer info */}
        <div className="p-4 border-t border-navy-200 dark:border-navy-800 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-2 py-1">
              <img 
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`} 
                alt="Avatar" 
                className="h-10 w-10 rounded-full border border-brand-500 bg-navy-100"
              />
              <div className="truncate">
                <p className="font-semibold text-sm truncate leading-tight">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-navy-400 truncate leading-tight capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl font-medium transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 glass-panel border-b border-navy-200 dark:border-navy-800">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-navy-200 dark:hover:bg-navy-800" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight capitalize">
              {location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button onClick={toggleDarkMode} className="p-2 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-800 rounded-lg">
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="h-5 w-5 hidden dark:block" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-800 rounded-lg"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-rose-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 shadow-xl rounded-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-navy-200 dark:border-navy-800 flex justify-between items-center bg-navy-50 dark:bg-navy-850">
                    <p className="font-semibold text-sm">Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-navy-100 dark:divide-navy-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-navy-400 text-xs">No alerts available</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-4 ${n.is_read ? 'opacity-70' : 'bg-brand-50/20 dark:bg-brand-950/10'}`}>
                          <div className="flex gap-2.5">
                            {n.type === 'alert' && <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />}
                            {n.type === 'task' && <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />}
                            {n.type === 'leave' && <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />}
                            {n.type === 'system' && <Home className="h-4 w-4 text-blue-500 shrink-0" />}
                            <div>
                              <p className="font-semibold text-xs leading-tight">{n.title}</p>
                              <p className="text-navy-500 dark:text-navy-400 text-xs mt-1 leading-normal">{n.message}</p>
                              <span className="text-[10px] text-navy-400 mt-2 block">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Passport link */}
            <Link 
              to={role === 'hr' ? '#' : '/profile'} 
              className="flex items-center gap-2 hover:opacity-85"
            >
              <div className="h-9 w-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                {user ? user.firstName[0] : 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// --- EMPLOYEE LAYOUT ---
export const EmployeeLayout = () => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/profile', label: 'Profile & Passport', icon: User },
    { to: '/attendance', label: 'Attendance', icon: Activity },
    { to: '/leaves', label: 'My Leaves', icon: Calendar },
    { to: '/tasks', label: 'My Work', icon: CheckSquare },
    { to: '/payroll', label: 'Payroll', icon: DollarSign }
  ];

  return <DashboardLayout role="employee" navLinks={links} />;
};

// --- HR LAYOUT ---
export const HRLayout = () => {
  const links = [
    { to: '/hr/dashboard', label: 'Command Center', icon: Home },
    { to: '/hr/digital-twin', label: 'Workforce Twin', icon: Activity },
    { to: '/hr/employees', label: 'Directory & Passports', icon: Users },
    { to: '/hr/leaves', label: 'Leave Requests', icon: Calendar },
    { to: '/hr/tasks', label: 'Task intelligence', icon: CheckSquare },
    { to: '/hr/balancer', label: 'Workload Balancer', icon: BarChart2 },
    { to: '/hr/continuity', label: 'Work Continuity', icon: Briefcase },
    { to: '/hr/payroll', label: 'Payroll Management', icon: DollarSign }
  ];

  return <DashboardLayout role="hr" navLinks={links} />;
};
