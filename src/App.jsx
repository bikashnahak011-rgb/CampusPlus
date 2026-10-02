import { lazy, Suspense, useEffect, useState } from 'react'

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import {
  AuthProvider,
  useAuth,
} from './contexts/AuthContext'

import { AppProvider } from './contexts/AppContext'

import { ToastProvider } from './components/ui/Toast'

import AppLogo from './components/AppLogo'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MobileOnboarding = lazy(() => import('./pages/MobileOnboarding'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

import PWAInstallPrompt from './components/PWAInstallPrompt'

import StudentLayout from './components/layout/StudentLayout'
import AdminLayout from './components/layout/AdminLayout'


/*
  ============================
  STUDENT PAGES
  ============================
*/

const StudentDashboard = lazy(() => import('./pages/student/Dashboard'))
const CampusJournalPage = lazy(() => import('./pages/student/CampusJournal'))
const ServicesPage = lazy(() => import('./pages/student/Services'))
const AttendancePage = lazy(() => import('./pages/student/Attendance'))
const TimetablePage = lazy(() => import('./pages/student/Timetable'))
const HostelPage = lazy(() => import('./pages/student/Hostel'))
const MessPage = lazy(() => import('./pages/student/Mess'))
const ComplaintsPage = lazy(() => import('./pages/student/Complaints'))
const LeavePage = lazy(() => import('./pages/student/Leave'))
const DocumentsPage = lazy(() => import('./pages/student/Documents'))
const FeesPage = lazy(() => import('./pages/student/Fees'))
const StudentExamResults = lazy(() => import('./pages/student/ExamResults'))
const NotificationsPage = lazy(() => import('./pages/student/Notifications'))
const ProfilePage = lazy(() => import('./pages/student/Profile'))
const SettingsPage = lazy(() => import('./pages/student/Settings'))
const SearchPage = lazy(() => import('./pages/student/Search'))
const BusRoutesPage = lazy(() => import('./pages/student/BusRoutes'))
const RoomFinderPage = lazy(() => import('./pages/student/RoomFinder'))
const FacultyDirectoryPage = lazy(() => import('./pages/FacultyDirectory'))


/*
  ============================
  ADMIN PAGES
  ============================
*/

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminCampusJournal = lazy(() => import('./pages/admin/CampusJournal'))
const AdminStudents = lazy(() => import('./pages/admin/Students'))
const AdminExamResults = lazy(() => import('./pages/admin/ExamResults'))
const AdminComplaints = lazy(() => import('./pages/admin/Complaints'))
const AdminRequests = lazy(() => import('./pages/admin/Requests'))
const AdminHostel = lazy(() => import('./pages/admin/Hostel'))
const AdminMess = lazy(() => import('./pages/admin/Mess'))
const AdminNotices = lazy(() => import('./pages/admin/Notices'))
const AdminAttendance = lazy(() => import('./pages/admin/Attendance'))
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'))
const AdminAIInsights = lazy(() => import('./pages/admin/AIInsights'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const AdminProfile = lazy(() => import('./pages/admin/Profile'))
const AdminBusRoutes = lazy(() => import('./pages/admin/BusRoutes'))
const AdminRoomFinder = lazy(() => import('./pages/admin/RoomFinder'))


/*
  ============================
  LOADING SCREEN
  ============================
*/

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient">
      <div className="flex flex-col items-center gap-4 animate-fade-in">

        <div
          style={{
            filter:
              'drop-shadow(0 0 24px rgba(255,255,255,0.25))',
          }}
          className="animate-pulse-slow"
        >
          <AppLogo size={56} />
        </div>

        <div className="flex gap-1.5">
          <span
            className="w-2 h-2 bg-emerald-200 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />

          <span
            className="w-2 h-2 bg-amber-200 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />

          <span
            className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>

        <p className="text-emerald-100 text-sm">
          Loading NexCampus...
        </p>

      </div>
    </div>
  )
}


/*
  ============================
  GET USER HOME
  ============================
*/

function getUserHome(user) {
  if (!user) {
    return '/login'
  }

  return user.role === 'admin'
    ? '/admin/dashboard'
    : '/student/dashboard'
}


/*
  ============================
  PROTECTED ROUTE
  ============================
*/

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  /*
    Wait for authentication to initialize.
  */

  if (loading) {
    return <Spinner />
  }

  /*
    No user = login.
  */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  /*
    Prevent student from opening admin pages
    and admin from opening student pages.
  */

  if (role && user.role !== role) {
    return (
      <Navigate
        to={getUserHome(user)}
        replace
      />
    )
  }

  return children
}


/*
  ============================
  PUBLIC LOGIN ROUTE
  ============================
*/

function LoginRoute() {
  const { user, loading } = useAuth()
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 767px)').matches
  })
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    if (typeof localStorage === 'undefined') return false
    return localStorage.getItem('campusplus_mobile_intro_seen') === 'true'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const updateViewport = (event) => setIsMobile(Boolean(event.matches))

    setIsMobile(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateViewport)
      return () => mediaQuery.removeEventListener('change', updateViewport)
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(updateViewport)
      return () => mediaQuery.removeListener(updateViewport)
    }

    return undefined
  }, [])

  if (loading) {
    return <Spinner />
  }

  /*
    If already logged in,
    don't show login page again.
  */

  if (user) {
    return (
      <Navigate
        to={getUserHome(user)}
        replace
      />
    )
  }

  if (isMobile && !hasSeenOnboarding) {
    return (
      <MobileOnboarding
        onComplete={() => {
          localStorage.setItem('campusplus_mobile_intro_seen', 'true')
          setHasSeenOnboarding(true)
        }}
      />
    )
  }

  return <LoginPage />
}


/*
  ============================
  ROOT ROUTE
  ============================
*/

function Root() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Spinner />
  }

  /*
    Logged-in user goes to correct dashboard.
  */

  if (user) {
    return (
      <Navigate
        to={getUserHome(user)}
        replace
      />
    )
  }

  return <Navigate to="/login" replace />
}


/*
  ============================
  APP
  ============================
*/

export default function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <AppProvider>

          <ToastProvider>

            <PWAInstallPrompt />

            <Suspense fallback={<Spinner />}>
              <Routes>

              {/* ================= ROOT ================= */}

              <Route
                path="/"
                element={<Root />}
              />

              {/* ================= LOGIN ================= */}

              <Route
                path="/login"
                element={<LoginRoute />}
              />

              <Route
                path="/landing"
                element={<LandingPage />}
              />

              {/* ================= ABOUT ================= */}

              <Route
                path="/about"
                element={<AboutPage />}
              />

              {/* ================= GOOGLE CALLBACK ================= */}

              <Route
                path="/auth/callback"
                element={<AuthCallback />}
              />


              {/* ================================================= */}
              {/*                    STUDENT                        */}
              {/* ================================================= */}

              <Route
                path="/student"
                element={
                  <ProtectedRoute role="student">
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >

                <Route
                  index
                  element={
                    <Navigate
                      to="dashboard"
                      replace
                    />
                  }
                />

                <Route
                  path="dashboard"
                  element={<StudentDashboard />}
                />

                <Route
                  path="services"
                  element={<ServicesPage />}
                />

                <Route
                  path="campus-journal"
                  element={<CampusJournalPage />}
                />

                <Route
                  path="bus-routes"
                  element={<BusRoutesPage />}
                />

                <Route
                  path="room-finder"
                  element={<RoomFinderPage />}
                />

                <Route
                  path="faculty"
                  element={<FacultyDirectoryPage />}
                />

                <Route
                  path="attendance"
                  element={<AttendancePage />}
                />

                <Route
                  path="timetable"
                  element={<TimetablePage />}
                />

                <Route
                  path="hostel"
                  element={<HostelPage />}
                />

                <Route
                  path="mess"
                  element={<MessPage />}
                />

                <Route
                  path="complaints"
                  element={<ComplaintsPage />}
                />

                <Route
                  path="leave"
                  element={<LeavePage />}
                />

                <Route
                  path="documents"
                  element={<DocumentsPage />}
                />

                <Route
                  path="fees"
                  element={<FeesPage />}
                />

                <Route
                  path="results"
                  element={<StudentExamResults />}
                />

                <Route
                  path="notifications"
                  element={<NotificationsPage />}
                />

                <Route
                  path="profile"
                  element={<ProfilePage />}
                />

                <Route
                  path="settings"
                  element={<SettingsPage />}
                />

                <Route
                  path="search"
                  element={<SearchPage />}
                />

              </Route>


              {/* ================================================= */}
              {/*                     ADMIN                        */}
              {/* ================================================= */}

              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >

                <Route
                  index
                  element={
                    <Navigate
                      to="dashboard"
                      replace
                    />
                  }
                />

                <Route
                  path="dashboard"
                  element={<AdminDashboard />}
                />

                <Route
                  path="students"
                  element={<AdminStudents />}
                />

                <Route
                  path="results"
                  element={<AdminExamResults />}
                />

                <Route
                  path="faculty"
                  element={<FacultyDirectoryPage />}
                />

                <Route
                  path="complaints"
                  element={<AdminComplaints />}
                />

                <Route
                  path="requests"
                  element={<AdminRequests />}
                />

                <Route
                  path="hostel"
                  element={<AdminHostel />}
                />

                <Route
                  path="mess"
                  element={<AdminMess />}
                />

                <Route
                  path="bus-routes"
                  element={<AdminBusRoutes />}
                />

                <Route
                  path="room-finder"
                  element={<AdminRoomFinder />}
                />

                <Route
                  path="notices"
                  element={<AdminNotices />}
                />

                <Route
                  path="campus-journal"
                  element={<AdminCampusJournal />}
                />

                <Route
                  path="attendance"
                  element={<AdminAttendance />}
                />

                <Route
                  path="analytics"
                  element={<AdminAnalytics />}
                />

                <Route
                  path="ai-insights"
                  element={<AdminAIInsights />}
                />

                <Route
                  path="settings"
                  element={<AdminSettings />}
                />

                <Route
                  path="profile"
                  element={<AdminProfile />}
                />

              </Route>


              {/* ================= 404 ================= */}

              <Route
                path="*"
                element={
                  <Navigate
                    to="/"
                    replace
                  />
                }
              />

              </Routes>
            </Suspense>

          </ToastProvider>

        </AppProvider>

      </AuthProvider>

    </BrowserRouter>
  )
}