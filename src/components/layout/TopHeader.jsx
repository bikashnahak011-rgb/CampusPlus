import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, Menu, User, Settings, LogOut, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { LANGUAGE_OPTIONS } from '../../lib/translations'
import AppLogo from '../AppLogo'

const priorityStyles = {
  critical: 'bg-red-100 text-red-700',
  important: 'bg-orange-100 text-orange-700',
  normal: 'bg-gray-100 text-gray-600',
}

export default function TopHeader({ onMenuClick }) {
  const { user, signOut } = useAuth()
  const { unreadCount, notifications, markRead, searchQuery, setSearchQuery, language, setLanguage, t } = useApp()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setShowNotifs(false); setShowProfile(false) } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const myNotifs = notifications.filter(n => n.user_id === user?.id).slice(0, 5)

  return (
    <>
      <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center px-3 sm:px-4 gap-2 sticky top-0 z-20 shadow-sm">
        {/* Hamburger */}
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl flex-shrink-0">
          <Menu size={20} />
        </button>

        {/* Search — hidden on mobile, shown on sm+ */}
        <div className="hidden sm:flex flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchQuery.trim() && navigate(`/student/search?q=${encodeURIComponent(searchQuery)}`)}
            placeholder={t('search')}
              className="w-full pl-9 pr-4 py-2 bg-violet-50 border border-violet-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
          />
        </div>

        {/* Mobile: show app name */}
        <div className="sm:hidden flex-1 min-w-0 flex items-center gap-2 text-sm font-bold text-gray-800">
          <AppLogo size={24} />
          <span>{t('appName')}</span>
        </div>

        <div className="flex items-center gap-1 ml-auto" ref={ref}>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="hidden rounded-xl border border-violet-200 bg-violet-50 px-2 py-1.5 text-xs font-medium text-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:block"
            aria-label={t('languageLabel')}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.nativeLabel}</option>
            ))}
          </select>
          {/* Mobile search toggle */}
          <button onClick={() => setShowSearch(!showSearch)} className="sm:hidden p-2 hover:bg-gray-100 rounded-xl">
            <Search size={19} className="text-gray-600" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false) }}
              className="relative p-2 hover:bg-gray-100 rounded-xl"
            >
              <Bell size={19} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl w-72 sm:w-80 z-50">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
                  <span className="font-semibold text-sm">{t('notifications')}</span>
                  <button onClick={() => { navigate('/student/notifications'); setShowNotifs(false) }} className="text-violet-700 text-xs hover:underline">{t('viewAll')}</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {myNotifs.length === 0
                    ? <p className="text-center text-gray-400 text-sm py-6">{t('noNotifications')}</p>
                    : myNotifs.map(n => (
                      <div key={n.id}
                        onClick={() => { markRead(n.id); navigate(n.link || '/student/notifications'); setShowNotifs(false) }}
                        className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-violet-50 ${!n.read ? 'bg-violet-50/40' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{n.title}</p>
                          {n.priority && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${priorityStyles[n.priority] || priorityStyles.normal}`}>{n.priority}</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifs(false) }}
              className="flex items-center gap-1.5 pl-1.5 pr-2 py-1.5 hover:bg-gray-100 rounded-xl"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold overflow-hidden flex-shrink-0"
                style={{ background: user?.avatar_url ? 'transparent' : '#2563eb' }}>
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  : (user?.name?.[0] || 'S')}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[90px] truncate">{user?.name}</span>
              <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl w-44 z-50 py-1">
                <button onClick={() => { navigate('/student/profile'); setShowProfile(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"><User size={15} /> {t('profile')}</button>
                <button onClick={() => { navigate('/student/settings'); setShowProfile(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"><Settings size={15} /> {t('settings')}</button>
                <hr className="my-1 border-gray-100" />
                <button onClick={async () => { await signOut(); navigate('/') }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={15} /> {t('logout')}</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile search bar — slides down when toggled */}
      {showSearch && (
        <div className="sm:hidden bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-2 z-20 sticky top-14">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) { navigate(`/student/search?q=${encodeURIComponent(searchQuery)}`); setShowSearch(false) } }}
              placeholder={t('searchComplaints')}
              className="w-full pl-8 pr-4 py-2 bg-violet-50 border border-violet-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <button onClick={() => setShowSearch(false)} className="p-1.5 text-gray-500"><X size={18} /></button>
        </div>
      )}
    </>
  )
}
