import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, MessageSquareWarning, ClipboardList, Building2, UtensilsCrossed, Megaphone, Calendar, BarChart3, Brain, Settings, LogOut, X, UserCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import AppLogo from '../AppLogo'

const WHATSAPP_LINK = 'https://chat.whatsapp.com/Fy1KjDyGVLJEpoVROjTdcv?s=sh&p=a&mlu=4&ilr=4'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/complaints', icon: MessageSquareWarning, label: 'Complaints' },
  { to: '/admin/requests', icon: ClipboardList, label: 'Requests' },
  { to: '/admin/hostel', icon: Building2, label: 'Hostel' },
  { to: '/admin/mess', icon: UtensilsCrossed, label: 'Mess' },
  { to: '/admin/notices', icon: Megaphone, label: 'Notices' },
  { to: '/admin/attendance', icon: Calendar, label: 'Attendance' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/ai-insights', icon: Brain, label: 'AI Insights' },
  { to: '/admin/profile', icon: UserCircle, label: 'My Profile' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminSidebar({ open, onClose }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-950 z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-hidden`}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <AppLogo size={32} showText />
            <span className="text-xs text-slate-400">Admin</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-3 px-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-4 py-2"><p className="text-slate-300 text-xs font-medium truncate">{user?.name}</p><p className="text-slate-500 text-xs">{user?.designation || 'Administrator'}</p></div>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-sidebar-link text-green-400 hover:text-green-300 hover:bg-green-500/10"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Group
          </a>
          <button onClick={async () => { await signOut(); navigate('/') }} className="admin-sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  )
}
