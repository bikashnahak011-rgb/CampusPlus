import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Grid3X3, ClipboardList, Calendar, GraduationCap, Building2, UtensilsCrossed, BusFront, MapPinned, MessageSquareWarning, DoorOpen, FileText, CreditCard, Bell, User, Settings, LogOut, X, Zap, Award, BookOpen, BriefcaseBusiness } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import AppLogo from '../AppLogo'

export default function StudentSidebar({ open, onClose }) {
  const { signOut, user } = useAuth()
  const { unreadCount, liteMode, t } = useApp()
  const navigate = useNavigate()

  const NAV = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/student/services', icon: Grid3X3, label: t('myServices') },
    { to: '/student/campus-journal', icon: BookOpen, label: t('campusJournal') },
    { to: '/student/attendance', icon: ClipboardList, label: t('attendance') },
    { to: '/student/results', icon: Award, label: t('examResults') },
    { to: '/student/timetable', icon: Calendar, label: t('timetable') },
    { to: '/student/faculty', icon: GraduationCap, label: t('faculty') },
    { to: '/student/hostel', icon: Building2, label: t('hostel') },
    { to: '/student/mess', icon: UtensilsCrossed, label: t('mess') },
    { to: '/student/bus-routes', icon: BusFront, label: t('busRoutes') },
    { to: '/student/room-finder', icon: MapPinned, label: t('roomFinder') },
    { to: '/student/complaints', icon: MessageSquareWarning, label: t('complaints') },
    { to: '/student/leave', icon: DoorOpen, label: t('leaveGatePass') },
    { to: '/student/documents', icon: FileText, label: t('documents') },
    { to: '/student/career-hub', icon: BriefcaseBusiness, label: 'Career Hub' },
    { to: '/student/fees', icon: CreditCard, label: t('feesDues') },
    { to: '/student/notifications', icon: Bell, label: t('notifications') },
    { to: '/student/profile', icon: User, label: t('profile') },
    { to: '/student/settings', icon: Settings, label: t('settings') },
  ]

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar-surface fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-hidden`}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <AppLogo size={32} showText lightText />
          </div>
          <button onClick={onClose} className="lg:hidden text-violet-200 hover:text-white"><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-3 px-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {label === t('notifications') && unreadCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          {liteMode && <div className="flex items-center gap-2 px-4 py-1.5 text-yellow-300 text-xs"><Zap size={13} /> Lite Mode Active</div>}
          <div className="px-4 py-1.5">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full mb-1 object-cover" />
              : null
            }
            <p className="text-violet-100 text-xs font-medium truncate">{user?.name}</p>
            <p className="text-violet-300 text-xs truncate">{user?.roll_no || user?.email?.split('@')[0]}</p>
          </div>
          <button onClick={async () => { await signOut(); navigate('/') }} className="sidebar-link logout-link w-full text-red-300 hover:text-red-200 hover:bg-red-500/10">
            <LogOut size={18} /> {t('logout')}
          </button>
        </div>
      </aside>
    </>
  )
}
