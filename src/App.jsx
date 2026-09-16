import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'
import { ToastProvider } from './components/ui/Toast'
import AppLogo from './components/AppLogo'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import AboutPage from './pages/AboutPage'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import StudentLayout from './components/layout/StudentLayout'
import AdminLayout from './components/layout/AdminLayout'

import StudentDashboard from './pages/student/Dashboard'
import ServicesPage from './pages/student/Services'
import AttendancePage from './pages/student/Attendance'
import TimetablePage from './pages/student/Timetable'
import HostelPage from './pages/student/Hostel'
import MessPage from './pages/student/Mess'
import ComplaintsPage from './pages/student/Complaints'
import LeavePage from './pages/student/Leave'
import DocumentsPage from './pages/student/Documents'
import FeesPage from './pages/student/Fees'
import NotificationsPage from './pages/student/Notifications'
import ProfilePage from './pages/student/Profile'
import SettingsPage from './pages/student/Settings'
import SearchPage from './pages/student/Search'

import AdminDashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminComplaints from './pages/admin/Complaints'
import AdminRequests from './pages/admin/Requests'
import AdminHostel from './pages/admin/Hostel'
import AdminMess from './pages/admin/Mess'
import AdminNotices from './pages/admin/Notices'
import AdminAttendance from './pages/admin/Attendance'
import AdminAnalytics from './pages/admin/Analytics'
import AdminAIInsights from './pages/admin/AIInsights'
import AdminSettings from './pages/admin/Settings'
import AdminProfile from './pages/admin/Profile'

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div style={{ filter: 'drop-shadow(0 0 24px rgba(255,255,255,0.25))' }} className="animate-pulse-slow">
          <AppLogo size={56} />
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-blue-200 text-sm">Loading CampusPlus...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  // Keep showing spinner while session is being resolved (covers OAuth redirect)
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />
  }
  return children
}

function Root() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />
  return <LandingPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <PWAInstallPrompt />
            <Routes>
              <Route path="/" element={<Root />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="timetable" element={<TimetablePage />} />
                <Route path="hostel" element={<HostelPage />} />
                <Route path="mess" element={<MessPage />} />
                <Route path="complaints" element={<ComplaintsPage />} />
                <Route path="leave" element={<LeavePage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="fees" element={<FeesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="search" element={<SearchPage />} />
              </Route>

              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="complaints" element={<AdminComplaints />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="hostel" element={<AdminHostel />} />
                <Route path="mess" element={<AdminMess />} />
                <Route path="notices" element={<AdminNotices />} />
                <Route path="attendance" element={<AdminAttendance />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="ai-insights" element={<AdminAIInsights />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
