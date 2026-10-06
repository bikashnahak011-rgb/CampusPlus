import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import StudentSidebar from './StudentSidebar'
import TopHeader from './TopHeader'
import AIAssistant from '../AIAssistant'
import MobileBottomNav from '../MobileBottomNav'
import Ambient3DBackground from '../Ambient3DBackground'
import WelcomePopup from '../WelcomePopup'
import { useAuth } from '../../contexts/AuthContext'

export default function StudentLayout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  return (
    <div className="internal-app min-h-screen flex relative overflow-hidden">
      <Ambient3DBackground />
      <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(value => !value)} />
      <div className={`flex-1 min-w-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} flex flex-col min-h-screen relative z-10 transition-[margin] duration-200`}>
        <TopHeader onMenuClick={() => setSidebarOpen(true)} />
        {/* pb-20 on mobile to account for bottom nav bar */}
        <main className="dashboard-main flex-1 min-w-0 w-full p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 animate-fade-in">
          {user?.isDemo && <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900"><strong>Demo preview</strong> · Sample campus data for {user.email}. Changes are local to this browser.</div>}
          <div className="page-enter"><Outlet /></div>
        </main>
      </div>
      <AIAssistant />
      <MobileBottomNav />
      <WelcomePopup />
    </div>
  )
}
