import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import StudentSidebar from './StudentSidebar'
import TopHeader from './TopHeader'
import AIAssistant from '../AIAssistant'
import MobileBottomNav from '../MobileBottomNav'

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <TopHeader onMenuClick={() => setSidebarOpen(true)} />
        {/* pb-20 on mobile to account for bottom nav bar */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 animate-fade-in">
          <div className="page-enter"><Outlet /></div>
        </main>
      </div>
      <AIAssistant />
      <MobileBottomNav />
    </div>
  )
}
