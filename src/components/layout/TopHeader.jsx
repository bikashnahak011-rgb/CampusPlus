import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, MessageSquare, ChevronDown, Menu, Globe, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'

export default function TopHeader({ onMenuClick }) {
  const { user, signOut } = useAuth()
  const { unreadCount, notifications, markRead, searchQuery, setSearchQuery } = useApp()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [lang, setLang] = useState('ENG')
  const [showLang, setShowLang] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setShowNotifs(false); setShowProfile(false); setShowLang(false) } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const myNotifs = notifications.filter(n => n.user_id === user?.id).slice(0, 5)

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-20 shadow-sm">
      <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"><Menu size={20} /></button>
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchQuery.trim() && navigate(`/student/search?q=${encodeURIComponent(searchQuery)}`)}
          placeholder="Search complaints, requests, notices..."
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </div>
      <div className="flex items-center gap-1 ml-auto" ref={ref}>
        <div className="relative">
          <button onClick={() => { setShowLang(!showLang); setShowNotifs(false); setShowProfile(false) }} className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-xl text-sm text-gray-600">
            <Globe size={15} /> {lang}
          </button>
          {showLang && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 min-w-[80px]">
              {['ENG','HIN','TAM','TEL','MAR'].map(l => <button key={l} onClick={() => { setLang(l); setShowLang(false) }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">{l}</button>)}
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); setShowLang(false) }} className="relative p-2 hover:bg-gray-100 rounded-xl">
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl w-80 z-50">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-semibold text-sm">Notifications</span>
                <button onClick={() => { navigate('/student/notifications'); setShowNotifs(false) }} className="text-blue-600 text-xs hover:underline">View all</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {myNotifs.length === 0 ? <p className="text-center text-gray-400 text-sm py-6">No notifications</p>
                  : myNotifs.map(n => (
                    <div key={n.id} onClick={() => { markRead(n.id); navigate(n.link || '/student/notifications'); setShowNotifs(false) }}
                      className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-blue-50/40' : ''}`}>
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        <button onClick={() => navigate('/student/notifications')} className="p-2 hover:bg-gray-100 rounded-xl"><MessageSquare size={20} className="text-gray-600" /></button>
        <div className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); setShowLang(false) }} className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 rounded-xl">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden" style={{background: user?.avatar_url ? 'transparent' : '#2563eb'}}>
              {user?.avatar_url ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" /> : (user?.name?.[0] || 'S')}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">{user?.name}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl w-48 z-50 py-1">
              <button onClick={() => { navigate('/student/profile'); setShowProfile(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"><User size={15} /> Profile</button>
              <button onClick={() => { navigate('/student/settings'); setShowProfile(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"><Settings size={15} /> Settings</button>
              <hr className="my-1 border-gray-100" />
              <button onClick={async () => { await signOut(); navigate('/') }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={15} /> Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
