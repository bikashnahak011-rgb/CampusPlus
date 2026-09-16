import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquareWarning, ClipboardList, Users, BarChart3 } from 'lucide-react'

const BOTTOM_NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/complaints', icon: MessageSquareWarning, label: 'Complaints' },
  { to: '/admin/requests', icon: ClipboardList, label: 'Requests' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function AdminMobileBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-700 flex items-center justify-around px-1 py-1">
      {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400'}`
        }>
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-500/20' : ''}`}>
                <Icon size={20} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
