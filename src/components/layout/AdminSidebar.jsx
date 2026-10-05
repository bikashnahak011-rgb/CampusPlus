import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, GraduationCap, MessageSquareWarning, ClipboardList, Building2, UtensilsCrossed, BusFront, MapPinned, Megaphone, Calendar, BarChart3, Brain, Settings, LogOut, X, UserCircle, Award, BookOpen, BriefcaseBusiness, Bell, Wallet, ClipboardCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import AppLogo from '../AppLogo'
import { ADMIN_ROLE_LABELS, getAdminNavigation } from '../../lib/adminRoles'

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
}

export default function AdminSidebar({ open, onClose }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const nav = getAdminNavigation(user?.admin_role)
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar-surface fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-hidden`}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <AppLogo size={32} showText lightText />
            <span className="text-xs text-slate-400">{ADMIN_ROLE_LABELS[user?.admin_role] || 'Admin'}</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-violet-200 hover:text-white"><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-3 px-3 space-y-0.5">
          {nav.map(({ to, label }) => {
            const path = to.split('/').pop()
            const Icon = ICONS_BY_PATH[path] || LayoutDashboard
            return (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />{label}
            </NavLink>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-4 py-2"><p className="text-slate-300 text-xs font-medium truncate">{user?.name}</p><p className="text-slate-500 text-xs">{user?.designation || ADMIN_ROLE_LABELS[user?.admin_role] || 'Administrator'}</p></div>
          <button onClick={async () => { await signOut(); navigate('/') }} className="admin-sidebar-link logout-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  )
}
