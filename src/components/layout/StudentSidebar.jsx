import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Grid3X3, ClipboardList, Calendar, GraduationCap, Building2, UtensilsCrossed, BusFront, MapPinned, MessageSquareWarning, DoorOpen, FileText, CreditCard, Bell, User, Settings, LogOut, X, Zap, Award, BookOpen, BriefcaseBusiness, NotebookTabs, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import AppLogo from '../AppLogo'
import Sidebar3DArtwork from './Sidebar3DArtwork'
import SidebarUserProfile from './SidebarUserProfile'
import { useState } from 'react'

export default function StudentSidebar({ open, onClose, collapsed = false, onToggleCollapse }) {
  const { signOut, user } = useAuth()
  const { unreadCount, liteMode, t } = useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [academicOpen, setAcademicOpen] = useState(() => pathname.startsWith('/student/syllabus') || pathname.startsWith('/student/timetable') || pathname.startsWith('/student/pyq') || pathname.startsWith('/student/class-material') || pathname.startsWith('/student/assignments'))

  const NAV = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/student/services', icon: Grid3X3, label: t('myServices') },
    { to: '/student/bus-routes', icon: BusFront, label: t('busRoutes') },
    { to: '/student/hostel', icon: Building2, label: t('hostel') },
    { to: '/student/complaints', icon: MessageSquareWarning, label: t('complaints') },
    { to: '/student/leave', icon: DoorOpen, label: t('leaveGatePass') },
    { section: 'Academic Resource', children: [
    { to: '/student/assignments', icon: ClipboardList, label: 'Assignments' },
    { to: '/student/syllabus', icon: BookOpen, label: 'Syllabus' },
      { to: '/student/timetable', icon: Calendar, label: t('timetable') },
      { to: '/student/pyq', icon: FileText, label: 'PYQ' },
      { to: '/student/class-material', icon: NotebookTabs, label: 'Class Material' },
    ] },
    { to: '/student/career-hub', icon: BriefcaseBusiness, label: 'Career Hub' },
    { to: '/student/room-finder', icon: MapPinned, label: t('roomFinder') },
    { to: '/student/mess', icon: UtensilsCrossed, label: t('mess') },
    { to: '/student/documents', icon: FileText, label: t('documents') },
    { to: '/student/campus-journal', icon: BookOpen, label: t('campusJournal') },
    { to: '/student/attendance', icon: ClipboardList, label: t('attendance') },
    { to: '/student/results', icon: Award, label: t('examResults') },
    { to: '/student/faculty', icon: GraduationCap, label: t('faculty') },
    { to: '/student/fees', icon: CreditCard, label: t('feesDues') },
    { to: '/student/notifications', icon: Bell, label: t('notifications') },
    { to: '/student/profile', icon: User, label: t('profile') },
    { to: '/student/settings', icon: Settings, label: t('settings') },
  ]

  return (
    <>
      {open && <div className="sidebar-backdrop fixed inset-0 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar-surface fixed top-0 left-0 h-full w-64 ${collapsed ? 'lg:w-20' : ''} ${collapsed ? 'sidebar-is-collapsed' : ''} z-40 flex flex-col transition-[width,transform] duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-hidden`}>
        <div className={`flex items-center justify-between border-b border-white/10 ${collapsed ? 'lg:flex-col lg:gap-3 lg:px-3 lg:py-4' : 'p-5'}`}>
          <div className={`flex items-center gap-2 ${collapsed ? 'lg:justify-center' : ''}`}>
            <AppLogo size={32} showText className="internal-brand" />
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={onToggleCollapse} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="sidebar-collapse-button hidden rounded-lg p-2 lg:inline-flex">
              {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </button>
            <button onClick={onClose} aria-label="Close navigation menu" className="sidebar-close-button lg:hidden"><X size={20} /></button>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-3 px-3 space-y-0.5">
          {NAV.map(item => {
            if (item.section) return (
              <div key={item.section}>
                <button type="button" title={item.section} aria-label={item.section} aria-expanded={academicOpen} onClick={() => setAcademicOpen(open => !open)} className={`sidebar-link w-full ${collapsed ? 'lg:justify-center lg:px-2' : ''} ${pathname.startsWith('/student/syllabus') || pathname.startsWith('/student/timetable') || pathname.startsWith('/student/pyq') || pathname.startsWith('/student/class-material') || pathname.startsWith('/student/assignments') ? 'active' : ''}`}>
                  <BookOpen size={18} />
                  <span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>{item.section}</span>
                  <ChevronDown size={16} className={`${collapsed ? 'lg:hidden' : ''} transition-transform ${academicOpen ? 'rotate-180' : ''}`} />
                </button>
                {academicOpen && <div className="sidebar-subnav ml-3 border-l pl-2">
                  {item.children.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} title={label} aria-label={label} onClick={onClose} className={({ isActive }) => `sidebar-link text-sm ${collapsed ? 'lg:justify-center lg:px-2' : ''} ${isActive ? 'active' : ''}`}>
                      <Icon size={16} />
                      <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
                    </NavLink>
                  ))}
                </div>}
              </div>
            )
            const { to, icon: Icon, label } = item
            return (
            <NavLink key={to} to={to} title={label} aria-label={label === t('notifications') && unreadCount > 0 ? `${label}, ${unreadCount} unread` : label} onClick={onClose} className={({ isActive }) => `sidebar-link ${collapsed ? 'lg:justify-center lg:px-2' : ''} ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
              {label === t('notifications') && unreadCount > 0 && <span className={`bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${collapsed ? 'lg:hidden' : ''}`}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </NavLink>
            )
          })}
        </nav>
        <Sidebar3DArtwork />
        <div className="p-3 border-t border-white/10 space-y-1">
          {liteMode && <div title="Lite Mode Active" className={`flex items-center gap-2 py-1.5 text-yellow-300 text-xs ${collapsed ? 'lg:justify-center lg:px-2' : 'px-4'}`}><Zap size={13} /><span className={collapsed ? 'lg:hidden' : ''}>Lite Mode Active</span></div>}
          <SidebarUserProfile
            name={user?.name}
            subtitle={user?.roll_no || user?.email?.split('@')[0] || 'Student'}
            avatarUrl={user?.avatar_url}
            collapsed={collapsed}
            fallbackInitial="S"
          />
          <button onClick={async () => { await signOut(); navigate('/') }} title={t('logout')} aria-label={t('logout')} className={`sidebar-link logout-link w-full text-red-300 hover:text-red-200 hover:bg-red-500/10 ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
            <LogOut size={18} /> <span className={collapsed ? 'lg:hidden' : ''}>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
