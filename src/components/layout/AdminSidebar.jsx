import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, GraduationCap, MessageSquareWarning, ClipboardList, Building2, UtensilsCrossed, BusFront, MapPinned, Megaphone, Calendar, BarChart3, Brain, Settings, LogOut, X, UserCircle, Award, BookOpen, BriefcaseBusiness, Bell, Wallet, ClipboardCheck, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AppLogo from '../AppLogo'
import { ADMIN_ROLE_LABELS, getAdminNavigation } from '../../lib/adminRoles'
import Sidebar3DArtwork from './Sidebar3DArtwork'
import SidebarUserProfile from './SidebarUserProfile'

const ICONS_BY_PATH = {
  dashboard: LayoutDashboard,
  main: LayoutDashboard,
  users: Users,
  students: Users,
  'hostel-students': Users,
  'room-allocation': MapPinned,
  maintenance: Building2,
  results: Award,
  examination: Award,
  marks: ClipboardCheck,
  faculty: GraduationCap,
  classes: GraduationCap,
  assignments: ClipboardCheck,
  'academic-performance': BarChart3,
  complaints: MessageSquareWarning,
  requests: ClipboardList,
  hostel: Building2,
  'room-finder': MapPinned,
  mess: UtensilsCrossed,
  'todays-menu': UtensilsCrossed,
  'mess-attendance': Calendar,
  fees: Wallet,
  payments: Wallet,
  accounts: Wallet,
  'accounts-examination': Wallet,
  reports: BarChart3,
  analytics: BarChart3,
  attendance: Calendar,
  notifications: Bell,
  profile: UserCircle,
  settings: Settings,
  'bus-routes': BusFront,
  notices: Megaphone,
  'campus-journal': BookOpen,
  'career-management': BriefcaseBusiness,
  'ai-insights': Brain,
  'academic-resources': BookOpen,
  'help-desk': ClipboardList,
  syllabus: BookOpen,
  timetable: Calendar,
  pyq: BookOpen,
  'class-material': ClipboardCheck,
}

export default function AdminSidebar({ open, onClose, collapsed = false, onToggleCollapse }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const nav = getAdminNavigation(user?.admin_role)
  const [academicOpen, setAcademicOpen] = useState(() => pathname.startsWith('/admin/academic-resources') || pathname.startsWith('/admin/timetable'))
  return (
    <>
      {open && <div className="sidebar-backdrop fixed inset-0 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar-surface fixed top-0 left-0 h-full w-64 ${collapsed ? 'lg:w-20 sidebar-is-collapsed' : ''} z-40 flex flex-col transition-[width,transform] duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-hidden`}>
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
          {nav.map(({ to, label, children }) => {
            const path = to.split('/').pop()
            const Icon = ICONS_BY_PATH[path] || LayoutDashboard
            if (children) {
              const active = pathname.startsWith('/admin/academic-resources') || pathname.startsWith('/admin/timetable')
              return (
                <div key={to}>
                  <button type="button" title={label} aria-label={label} aria-expanded={academicOpen} onClick={() => setAcademicOpen(open => !open)} className={`admin-sidebar-link w-full ${collapsed ? 'lg:justify-center lg:px-2' : ''} ${active ? 'active' : ''}`}>
                    <Icon size={18} /><span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>{label}</span><ChevronDown size={16} className={`${collapsed ? 'lg:hidden' : ''} transition-transform ${academicOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {academicOpen && <div className="sidebar-subnav ml-3 border-l pl-2">
                    {children.map(child => {
                      const ChildIcon = ICONS_BY_PATH[child.to.split('/').pop()] || BookOpen
                      return <NavLink key={child.to} to={child.to} title={child.label} aria-label={child.label} onClick={onClose} className={({ isActive }) => `admin-sidebar-link text-sm ${collapsed ? 'lg:justify-center lg:px-2' : ''} ${isActive ? 'active' : ''}`}><ChildIcon size={16} /><span className={collapsed ? 'lg:hidden' : ''}>{child.label}</span></NavLink>
                    })}
                  </div>}
                </div>
              )
            }
            return (
            <div key={to}>
            <NavLink to={to} title={label} aria-label={label} onClick={onClose} className={({ isActive }) => `admin-sidebar-link ${collapsed ? 'lg:justify-center lg:px-2' : ''} ${isActive ? 'active' : ''}`}>
              <Icon size={18} /><span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
            </NavLink>
            </div>
            )
          })}
        </nav>
        <Sidebar3DArtwork />
        <div className="sidebar-profile-area p-3 border-t border-white/10">
          <SidebarUserProfile
            name={user?.name}
            subtitle={user?.designation || ADMIN_ROLE_LABELS[user?.admin_role] || 'Administrator'}
            avatarUrl={user?.avatar_url}
            collapsed={collapsed}
            fallbackInitial="A"
          />
          <button onClick={async () => { await signOut(); navigate('/') }} title="Logout" aria-label="Logout" className={`admin-sidebar-link logout-link w-full ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
            <LogOut size={18} /> <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
