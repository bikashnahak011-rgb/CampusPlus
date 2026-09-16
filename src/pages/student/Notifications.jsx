import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, CheckCircle, AlertCircle, Info, Megaphone } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { EmptyState } from '../../components/ui/States'

const typeIcon = { success: CheckCircle, warning: AlertCircle, info: Info, error: AlertCircle }
const typeColor = { success: 'text-green-500', warning: 'text-yellow-500', info: 'text-blue-500', error: 'text-red-500' }

export default function NotificationsPage() {
  const { user } = useAuth()
  const { notifications, notices, markRead, markAllRead } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Notifications')

  const myNotifs = notifications.filter(n => n.user_id === user?.id)
  const unread = myNotifs.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications & Notices</h1>
          <p className="text-gray-500 text-sm mt-1">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm">
            <CheckCheck size={16} /> Mark All Read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {['Notifications', 'Notices'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
        ))}
      </div>

      {tab === 'Notifications' && (
        <div className="space-y-2">
          {myNotifs.length === 0
            ? <div className="card"><EmptyState message="No notifications yet." icon={Bell} /></div>
            : myNotifs.map(n => {
                const Icon = typeIcon[n.type] || Info
                return (
                  <button key={n.id} onClick={() => { markRead(n.id); if (n.link) navigate(n.link) }}
                    className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-colors hover:shadow-sm ${!n.read ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon size={18} className={typeColor[n.type]} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                        {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('en-IN')}</p>
                    </div>
                  </button>
                )
              })}
        </div>
      )}

      {tab === 'Notices' && (
        <div className="space-y-3">
          {notices.length === 0
            ? <div className="card"><EmptyState message="No notices." icon={Megaphone} /></div>
            : notices.map(n => (
                <div key={n.id} className={`card ${n.important ? 'border-l-4 border-l-orange-400' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {n.important && <span className="badge bg-orange-100 text-orange-700 text-xs">Important</span>}
                        <span className="badge bg-gray-100 text-gray-600 text-xs">{n.target}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{n.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{n.content}</p>
                      <p className="text-xs text-gray-400 mt-2">{n.created_by} • {new Date(n.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      )}
    </div>
  )
}
