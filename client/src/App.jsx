import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Entities from './pages/Entities'
import EntityForm from './pages/EntityForm'
import Departments from './pages/Departments'
import EmployeeGroups from './pages/EmployeeGroups'
import EmployeeGrades from './pages/EmployeeGrades'
import Holidays from './pages/Holidays'
import Employees from './pages/Employees'
import EmployeeForm from './pages/EmployeeForm'
import EmployeeKETs from './pages/EmployeeKETs'
import EmployeeDocuments from './pages/EmployeeDocuments'
import Leave from './pages/Leave'
import LeavePolicies from './pages/LeavePolicies'
import Attendance from './pages/Attendance'
import Payroll from './pages/Payroll'
import Payslip from './pages/Payslip'
import Reports from './pages/Reports'
import IRASCompliance from './pages/IRASCompliance'
import Users from './pages/Users'
import UserRoles from './pages/UserRoles'
import Customers from './pages/Customers'
import Sites from './pages/Sites'
import ShiftSettings from './pages/ShiftSettings'
import FaceRegistration from './pages/FaceRegistration'
import FaceAttendance from './pages/FaceAttendance'
import AuditLogs from './pages/AuditLogs'
import PlatformAdmin from './pages/PlatformAdmin'
import Profile from './pages/Profile'
import OnboardingWizard from './pages/OnboardingWizard'

import Landing from './pages/Landing'
import Signup from './pages/Signup'

import { useEffect, useState } from 'react'

function ProtectedRoute({ children }) {
  const { isAuthenticated, user, loading: authLoading, setEntities, switchEntity, activeEntity, logout } = useAuth()
  const [entitiesLoading, setEntitiesLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      setEntitiesLoading(true);
      import('./services/api').then(({ default: api }) => {
        api.getEntities()
          .then(data => {
            if (data.length === 0) {
              console.error("User has no assigned entities. Logging out.");
              logout();
              return;
            }
            setEntities(data);
            if (!activeEntity && data.length > 0) {
              switchEntity(data[0]);
            }
          })
          .catch(err => console.error('Failed to load entities', err))
          .finally(() => setEntitiesLoading(false));
      });
    }
  }, [isAuthenticated, activeEntity]);

  if (authLoading || entitiesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-main)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    )
  }

  const isOnboarded = user?.onboardingCompleted === true;
  const isSysAdmin = !!(user?.isSystemAdmin || user?.is_system_admin);

  if (isAuthenticated && !isOnboarded && !isSysAdmin && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />

      <Route path="/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/entities" element={<Entities />} />
        <Route path="/entities/add" element={<EntityForm />} />
        <Route path="/entities/edit/:id" element={<EntityForm />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/employee-groups" element={<EmployeeGroups />} />
        <Route path="/employee-grades" element={<EmployeeGrades />} />
        <Route path="/holidays" element={<Holidays />} />
        <Route path="/shift-settings" element={<ShiftSettings />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/add" element={<EmployeeForm />} />
        <Route path="/employees/edit/:id" element={<EmployeeForm />} />
        <Route path="/employees/:id/kets" element={<EmployeeKETs />} />
        <Route path="/employees/:id/documents" element={<EmployeeDocuments />} />
        <Route path="/employees/:id/face" element={<FaceRegistration />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/leave-policies" element={<LeavePolicies />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/face" element={<FaceAttendance />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/payroll/payslip/:id" element={<Payslip />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/iras" element={<IRASCompliance />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/users" element={<Users />} />
        <Route path="/user-roles" element={<UserRoles />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/sites" element={<Sites />} />
        <Route path="/platform-admin" element={<PlatformAdmin />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
