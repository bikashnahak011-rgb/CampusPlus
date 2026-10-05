import { useState } from 'react'
import { Shield, Bell, Database, Zap, Moon, Eye, Plus, Trash2 } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import DashboardVideoShowcase from '../../components/DashboardVideoShowcase'
import { supabase } from '../../lib/supabase'

const configured = Boolean(supabase)

const accentStyles = {
  blue: {
    container: 'bg-blue-50 border-blue-200',
    iconBox: 'bg-blue-100',
    icon: 'text-blue-600',
    switch: 'bg-blue-600',
  },
  yellow: {
    container: 'bg-yellow-50 border-yellow-200',
    iconBox: 'bg-yellow-100',
    icon: 'text-yellow-600',
    switch: 'bg-yellow-600',
  },
  purple: {
    container: 'bg-purple-50 border-purple-200',
    iconBox: 'bg-purple-100',
    icon: 'text-purple-600',
    switch: 'bg-purple-600',
  },
}

const getStoredBoolean = (key) => {
  if (typeof window === 'undefined' || !window.localStorage) return false
  return window.localStorage.getItem(key) === 'true'
}

const Toggle = ({ value, onChange, label, desc, icon: Icon, accent = 'blue' }) => {
  const styles = accentStyles[accent] ?? accentStyles.blue

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${value ? `${styles.container}` : 'bg-gray-50 border-transparent'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${styles.iconBox} rounded-xl flex items-center justify-center`}>
          <Icon size={18} className={styles.icon} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${value ? styles.switch : 'bg-gray-300'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function AdminSettings() {
  const { liteMode, setLiteMode, dashboardVideos, addDashboardVideo, removeDashboardVideo } = useApp()
  const [largeText, setLargeText] = useState(() => getStoredBoolean('cp_large_text'))
  const [highContrast, setHighContrast] = useState(() => getStoredBoolean('cp_contrast'))
  const [videoTitle, setVideoTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoMessage, setVideoMessage] = useState('')

  const handleLargeText = (v) => {
    setLargeText(v)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cp_large_text', String(v))
    }
    document.documentElement.style.fontSize = v ? '18px' : ''
  }

  const handleHighContrast = (v) => {
    setHighContrast(v)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cp_contrast', String(v))
    }
    document.body.classList.toggle('high-contrast', v)
  }

  const handleAddVideo = (event) => {
    event.preventDefault()
    try {
      addDashboardVideo({ title: videoTitle.trim() || 'Campus Event', url: videoUrl })
      setVideoTitle('')
      setVideoUrl('')
      setVideoMessage('Video saved successfully.')
    } catch (error) {
      setVideoMessage(error.message)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Admin configuration and preferences</p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">Dashboard videos</h2>
            <p className="text-xs text-gray-500 mt-1">Keep only two active campus videos on both dashboards.</p>
          </div>
        </div>

        <DashboardVideoShowcase videos={dashboardVideos} showAdminControls onDelete={removeDashboardVideo} />

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <h3 className="font-medium text-gray-900">Add YouTube link</h3>
          <form onSubmit={handleAddVideo} className="space-y-3">
            <input
              value={videoTitle}
              onChange={(event) => setVideoTitle(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              placeholder="Event title"
            />
            <input
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              type="url"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              <Plus size={16} /> Add video
            </button>
          </form>
          {videoMessage && <p className="text-xs text-emerald-700">{videoMessage}</p>}
        </div>

        <div className="space-y-2">
          {dashboardVideos.length === 0 ? (
            <p className="text-sm text-gray-500">No videos active yet.</p>
          ) : dashboardVideos.map((video) => (
            <div key={video.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{video.title}</p>
                <p className="text-xs text-gray-500 truncate max-w-xs">{video.url}</p>
              </div>
              <button
                type="button"
                onClick={() => removeDashboardVideo(video.id)}
                className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900 mb-2">System Status</h2>
        <div className={`flex items-center gap-3 p-4 rounded-2xl ${configured ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <Database size={20} className={configured ? 'text-green-600' : 'text-yellow-600'} />
          <div>
            <p className="text-sm font-medium text-gray-900">Supabase Connection</p>
            <p className={`text-xs ${configured ? 'text-green-600' : 'text-yellow-600'}`}>
              {configured ? 'Credentials configured; database connection is checked when data loads.' : 'Not configured. Add Supabase URL and anon key to the deployment environment.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
          <Shield size={20} className="text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Row Level Security</p>
            <p className="text-xs text-blue-600">Apply the Supabase schema and production hardening migrations to enforce role-based policies.</p>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900 mb-2">Performance</h2>
        <Toggle
          value={liteMode} onChange={setLiteMode}
          label="⚡ Lite Mode" desc="Reduces animations for better performance"
          icon={Zap} accent="yellow"
        />
        {liteMode && <p className="text-xs text-yellow-700 bg-yellow-50 rounded-xl p-3">⚡ Lite Mode is active.</p>}
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900 mb-2">Notifications</h2>
        <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <Bell size={20} className="shrink-0 text-blue-600" />
          <div><p className="text-sm font-medium text-gray-900">In-app request and complaint alerts</p><p className="text-xs text-gray-600">Review live records in their admin sections. Desktop push alerts while this app is closed are not configured.</p></div>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900 mb-2">Accessibility</h2>
        <Toggle
          value={largeText} onChange={handleLargeText}
          label="Large Text" desc="Increase font size for better readability"
          icon={Eye} accent="purple"
        />
        <Toggle
          value={highContrast} onChange={handleHighContrast}
          label="High Contrast" desc="Improve visibility with higher contrast"
          icon={Moon} accent="purple"
        />
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Database Schema</h2>
        <p className="text-sm text-gray-500 mb-3">Run this SQL in your Supabase dashboard to set up the database:</p>
        <div className="bg-gray-900 rounded-xl p-4 text-xs text-green-400 font-mono overflow-x-auto">
          <p>-- See supabase/schema.sql for full schema</p>
          <p>-- Tables: profiles, complaints, requests,</p>
          <p>-- leave_requests, notices, notifications,</p>
          <p>-- mess_feedback, subjects, timetable</p>
        </div>
      </div>
    </div>
  )
}
