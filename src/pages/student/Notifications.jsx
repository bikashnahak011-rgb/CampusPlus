import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, CheckCircle, AlertCircle, Info, Megaphone, FileCheck2, MessageSquareText, Award } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { EmptyState } from '../../components/ui/States'
import { matchesNoticeTarget } from '../../lib/noticeAudience'
import { enablePushNotifications } from '../../lib/pushNotifications'
import { useToast } from '../../components/ui/Toast'

const typeIcon = { success: CheckCircle, warning: AlertCircle, info: Info, error: AlertCircle, message: MessageSquareText, notice: Megaphone, certificate: FileCheck2, exam_result: Award }
const typeColor = { success: 'text-green-500', warning: 'text-yellow-500', info: 'text-blue-500', error: 'text-red-500', message: 'text-blue-600', notice: 'text-orange-600', certificate: 'text-emerald-600', exam_result: 'text-amber-600' }
const typeLabel = { message: 'Message', notice: 'Notice', certificate: 'Certificate', exam_result: 'Exam result' }
const priorityStyles = {
  critical: 'bg-red-100 text-red-700',
  important: 'bg-orange-100 text-orange-700',
  normal: 'bg-gray-100 text-gray-600',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const { notifications, notices, markRead, markAllRead } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Notifications')
  const [enablingPush, setEnablingPush] = useState(false)
  const myNotifs = notifications.filter(n => n.user_id === user?.id)
  const myNotices = notices.filter(notice => matchesNoticeTarget(notice.target, user))
  const unread = myNotifs.filter(n => !n.read).length
  const requestPush = async () => {
    setEnablingPush(true)
    try {
      await enablePushNotifications()
      toast('Mobile push alerts are enabled on this device.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setEnablingPush(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications & Notices</h1>
          <p className="text-gray-500 text-sm mt-1">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button onClick={requestPush} disabled={enablingPush} className="btn-secondary text-sm disabled:opacity-60">
            <Bell size={16} /> {enablingPush ? 'Enabling…' : 'Enable push alerts'}
          </button>
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-secondary text-sm">
              <CheckCheck size={16} /> Mark All Read
            </button>
          )}
        </div>
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
                        <div className="flex min-w-0 items-center gap-2">
                          <p className={`truncate text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                          {typeLabel[n.type] && <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{typeLabel[n.type]}</span>}
                          {n.priority && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${priorityStyles[n.priority] || priorityStyles.normal}`}>{n.priority}</span>}
                        </div>
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
          {myNotices.length === 0
            ? <div className="card"><EmptyState message="No notices." icon={Megaphone} /></div>
            : myNotices.map(n => (
                <div key={n.id} className={`card ${n.priority === 'critical' ? 'border-l-4 border-l-red-500' : n.priority === 'important' || n.important ? 'border-l-4 border-l-orange-400' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`badge text-xs capitalize ${priorityStyles[n.priority || (n.important ? 'important' : 'normal')]}`}>
                          {n.priority || (n.important ? 'Important' : 'Normal')}
                        </span>
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
