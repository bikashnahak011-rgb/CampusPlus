import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquareWarning, ClipboardList, Users, BarChart3, Building2, UtensilsCrossed, GraduationCap, Wallet, Award } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { getAdminNavigation } from '../lib/adminRoles'

const ICONS_BY_PATH = {
  dashboard: LayoutDashboard,
  main: LayoutDashboard,
  students: Users,
  'hostel-students': Users,
  'room-allocation': Building2,
  hostel: Building2,
  maintenance: Building2,
  mess: UtensilsCrossed,
  'todays-menu': UtensilsCrossed,
  'mess-attendance': ClipboardList,
  faculty: GraduationCap,
  classes: GraduationCap,
  assignments: ClipboardList,
  'academic-performance': BarChart3,
  attendance: ClipboardList,
  complaints: MessageSquareWarning,
  requests: ClipboardList,
  fees: Wallet,
  payments: Wallet,
  accounts: Wallet,
  results: Award,
  marks: Award,
  analytics: BarChart3,
  reports: BarChart3,
  notifications: ClipboardList,
  profile: Users,
}

export default function AdminMobileBottomNav() {
  const { user } = useAuth()
  const { t } = useApp()
  const nav = getAdminNavigation(user?.admin_role).slice(0, 5)
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-700 flex items-center justify-around px-1 py-1">
      {nav.map(({ to, label }) => {
        const translatedLabel = t(label, label)
        const Icon = ICONS_BY_PATH[to.split('/').pop()] || LayoutDashboard
        return (
        <NavLink key={to} to={to} className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-2 sm:px-3 py-1.5 rounded-xl transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`
        }>
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-white/15' : ''}`}>
                <Icon size={20} />
              </div>
              <span className="text-[10px] font-medium">{translatedLabel}</span>
            </>
          )}
        </NavLink>
        )
      })}
    </nav>
  )
}
