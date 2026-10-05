import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function AdminNotifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(Boolean(supabase) && !user?.isDemo)
  const [error, setError] = useState(user?.isDemo
    ? 'Notifications are only available to authenticated Supabase users.'
    : supabase ? '' : 'Supabase is not configured. Check the project environment settings.')

  useEffect(() => {
    let active = true

    const loadNotifications = async () => {
      if (!supabase || user?.isDemo) return

      const { data, error: queryError } = await supabase
        .from('notifications')
        .select('id,title,message,type,link,read,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!active) return
      if (queryError) setError(queryError.message)
      else setNotifications(data || [])
      setLoading(false)
    }

    loadNotifications()
    return () => { active = false }
  }, [user.id, user?.isDemo])

  const markRead = async (notification) => {
    if (!supabase || notification.read) return
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification.id)
      .eq('user_id', user.id)

    if (updateError) {
      setError(updateError.message)
      return
    }
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item))
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">{unreadCount} unread update{unreadCount === 1 ? '' : 's'}</p>
        </div>
        <Bell className="text-violet-600" />
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="space-y-3">
        {loading ? <p className="card text-sm text-gray-500">Loading notifications...</p> : notifications.length === 0 ? (
          <div className="card text-center text-sm text-gray-500">You are all caught up.</div>
        ) : notifications.map((notification) => (
          <article key={notification.id} className={`card flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${notification.read ? 'opacity-75' : 'border-violet-200'}`}>
            <button
              onClick={async () => {
                await markRead(notification)
                if (notification.link?.startsWith('/admin/')) navigate(notification.link)
              }}
              className="min-w-0 flex-1 text-left"
            >
              <div className="flex items-start gap-3">
                <span className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-violet-600'}`} />
                <span>
                  <span className="block font-semibold text-gray-900">{notification.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-gray-600">{notification.message}</span>
                  <span className="mt-2 block text-xs text-gray-400">{notification.created_at ? new Date(notification.created_at).toLocaleString() : notification.type}</span>
                </span>
              </div>
            </button>
            {!notification.read && <span className="inline-flex items-center gap-1 self-start text-xs font-semibold text-violet-700"><CheckCheck size={14} /> New</span>}
          </article>
        ))}
      </div>
    </section>
  )
}
