import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquareWarning, ClipboardList, Bell, Grid3X3 } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

const BOTTOM_NAV = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/student/services', icon: Grid3X3, label: 'Services' },
  { to: '/student/complaints', icon: MessageSquareWarning, label: 'Complaints' },
  { to: '/student/attendance', icon: ClipboardList, label: 'Attendance' },
  { to: '/student/notifications', icon: Bell, label: 'Alerts' },
]

export default function MobileBottomNav() {
  const { unreadCount } = useApp()
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex items-center justify-around px-1 py-1 safe-area-pb">
      {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors relative ${isActive ? 'text-violet-700' : 'text-gray-500'}`
        }>
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-violet-50' : ''}`}>
                <Icon size={20} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {label === 'Alerts' && unreadCount > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
