import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import StudentSidebar from './StudentSidebar'
import TopHeader from './TopHeader'
import AIAssistant from '../AIAssistant'
import MobileBottomNav from '../MobileBottomNav'
import Ambient3DBackground from '../Ambient3DBackground'

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-violet-50 flex relative overflow-hidden">
      <Ambient3DBackground />
      <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative z-10">
        <TopHeader onMenuClick={() => setSidebarOpen(true)} />
        {/* pb-20 on mobile to account for bottom nav bar */}
        <main className="dashboard-main flex-1 p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 animate-fade-in">
          <div className="page-enter"><Outlet /></div>
        </main>
      </div>
      <AIAssistant />
      <MobileBottomNav />
    </div>
  )
}
