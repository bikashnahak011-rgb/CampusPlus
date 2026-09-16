import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, Settings, Search } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import AdminMobileBottomNav from '../AdminMobileBottomNav'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Header */}
        <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center px-3 sm:px-4 gap-2 sticky top-0 z-20 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl flex-shrink-0">
            <Menu size={20} />
          </button>

          {/* Search — desktop only */}
          <div className="hidden sm:flex flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search students, complaints..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Mobile title */}
          <span className="sm:hidden flex-1 text-sm font-bold text-gray-800">Admin Panel</span>

          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => navigate('/admin/requests')} className="relative p-2 hover:bg-gray-100 rounded-xl">
              <Bell size={19} className="text-gray-600" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-1.5 pl-1.5 pr-2 py-1.5 hover:bg-gray-100 rounded-xl"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                  {user?.name?.[0] || 'A'}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[90px] truncate">{user?.name}</span>
                <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
              </button>
              {showProfile && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl w-44 z-50 py-1">
                  <button onClick={() => { navigate('/admin/profile'); setShowProfile(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2">Profile</button>
                  <button onClick={() => { navigate('/admin/settings'); setShowProfile(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"><Settings size={15} /> Settings</button>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={async () => { await signOut(); navigate('/') }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={15} /> Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content — pb-20 on mobile for bottom nav */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 animate-fade-in">
          <div className="page-enter"><Outlet /></div>
        </main>
      </div>
      <AdminMobileBottomNav />
    </div>
  )
}
