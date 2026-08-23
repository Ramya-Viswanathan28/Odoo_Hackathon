import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicLayout, EmployeeLayout, HRLayout } from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

// Employee Pages
import EmployeeDashboard from './pages/Employee/Dashboard';
import EmployeeProfile from './pages/Employee/Profile';
import EmployeeAttendance from './pages/Employee/Attendance';
import EmployeeLeaves from './pages/Employee/Leaves';
import EmployeeWork from './pages/Employee/MyWork';
import EmployeePayroll from './pages/Employee/Payroll';

// HR Pages
import HRDashboard from './pages/HR/Dashboard';
import HRDigitalTwin from './pages/HR/DigitalTwin';
import HREmployees from './pages/HR/Employees';
import HRLeaveManagement from './pages/HR/LeaveManagement';
import HRTasks from './pages/HR/Tasks';
import HRBalancer from './pages/HR/Balancer';
import HRContinuity from './pages/HR/Continuity';
import HRPayroll from './pages/HR/Payroll';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50 dark:bg-navy-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own role-based dashboard if they try to access unauthorized routes
    return user.role === 'hr' 
      ? <Navigate to="/hr/dashboard" replace /> 
      : <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* Employee Protected Routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route path="/profile" element={<EmployeeProfile />} />
            <Route path="/attendance" element={<EmployeeAttendance />} />
            <Route path="/leaves" element={<EmployeeLeaves />} />
            <Route path="/tasks" element={<EmployeeWork />} />
            <Route path="/payroll" element={<EmployeePayroll />} />
          </Route>

          {/* HR Protected Routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['hr']}>
              <HRLayout />
            </ProtectedRoute>
          }>
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/digital-twin" element={<HRDigitalTwin />} />
            <Route path="/hr/employees" element={<HREmployees />} />
            <Route path="/hr/leaves" element={<HRLeaveManagement />} />
            <Route path="/hr/tasks" element={<HRTasks />} />
            <Route path="/hr/balancer" element={<HRBalancer />} />
            <Route path="/hr/continuity" element={<HRContinuity />} />
            <Route path="/hr/payroll" element={<HRPayroll />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
