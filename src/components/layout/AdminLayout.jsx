import { useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, Settings, Search } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import AdminMobileBottomNav from '../AdminMobileBottomNav'
import AIAssistant from '../AIAssistant'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { LANGUAGE_OPTIONS } from '../../lib/translations'
import Ambient3DBackground from '../Ambient3DBackground'
import AppLogo from '../AppLogo'
import { ADMIN_ROLES, ADMIN_ROLE_LABELS, canAccessAdminPath, getAdminHomePath } from '../../lib/adminRoles'

function AdminModuleGuard() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  if (user?.role !== 'admin' || !user?.admin_role || user?.is_active === false) {
    return <Navigate to="/unauthorized" replace />
  }

  if (!canAccessAdminPath(user.admin_role, pathname, user.email)) {
    return <Navigate to={getAdminHomePath(user.admin_role, user.email)} replace />
  }

  return <Outlet />
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { user, signOut } = useAuth()
  const { unreadCount, language, setLanguage, t } = useApp()
  const navigate = useNavigate()

  return (
    <div className="internal-app min-h-screen flex relative overflow-hidden">
      <Ambient3DBackground />
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(value => !value)} />
      <div className={`flex-1 min-w-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} flex flex-col min-h-screen relative z-10 transition-[margin] duration-200`}>

        {/* Header */}
        <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center px-3 sm:px-4 gap-2 sticky top-0 z-20 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} aria-label={t('Open navigation menu')} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl flex-shrink-0">
            <Menu size={20} />
          </button>

          {/* Search — desktop only */}
          <div className="hidden sm:flex flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder={t('Search across NexCampus')}
              aria-label={t('Search across NexCampus')}
              className="app-search-field w-full pl-9 pr-4 py-2 bg-violet-50 border border-violet-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Mobile title */}
          <div className="sm:hidden flex-1 min-w-0 flex items-center gap-2 text-sm font-bold text-gray-800">
            <AppLogo size={24} />
            <span>{t(ADMIN_ROLE_LABELS[user?.admin_role] || 'Admin Panel')}</span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <select
              value={language}
              onChange={event => setLanguage(event.target.value)}
              aria-label={t('languageLabel')}
              className="max-w-20 rounded-xl border border-violet-200 bg-violet-50 px-1.5 py-1.5 text-[10px] font-medium text-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:max-w-none sm:px-2 sm:text-xs"
            >
              {LANGUAGE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.nativeLabel}</option>)}
            </select>
            <button onClick={() => navigate('/admin/notifications')} className="relative p-2 hover:bg-gray-100 rounded-xl" aria-label={`${t('notifications')}${unreadCount ? `, ${unreadCount} unread` : ''}`}>
              <Bell size={19} className="text-gray-600" />
              {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-none text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                aria-expanded={showProfile}
                aria-label={t('Open account menu')}
                className="flex items-center gap-1.5 pl-1.5 pr-2 py-1.5 hover:bg-gray-100 rounded-xl"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-500 to-indigo-700 rounded-full ring-2 ring-violet-100 flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                  {user?.name?.[0] || 'A'}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[90px] truncate">{user?.name}</span>
                <span className="hidden xl:inline rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">{t(ADMIN_ROLE_LABELS[user?.admin_role] || 'Admin')}</span>
                <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
              </button>
              {showProfile && (
                <div className="internal-dropdown absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl w-44 z-50 py-1">
                  <button onClick={() => { navigate('/admin/profile'); setShowProfile(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2">{t('profile')}</button>
                  {user?.admin_role === ADMIN_ROLES.MAIN_ADMINISTRATOR && (
                    <button onClick={() => { navigate('/admin/settings'); setShowProfile(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"><Settings size={15} /> {t('settings')}</button>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button onClick={async () => { await signOut(); navigate('/') }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={15} /> {t('logout')}</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content — pb-20 on mobile for bottom nav */}
        <main className="dashboard-main flex-1 min-w-0 w-full p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 animate-fade-in">
          <div className="page-enter"><AdminModuleGuard /></div>
        </main>
      </div>
      <AdminMobileBottomNav />
      <AIAssistant />
    </div>
  )
}
