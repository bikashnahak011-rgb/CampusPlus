import { useState } from 'react'
import { Shield, Bell, Database, Zap, Moon, Eye } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { supabase } from '../../lib/supabase'

const configured = Boolean(supabase)

const Toggle = ({ value, onChange, label, desc, icon: Icon, accent = 'blue' }) => (
  <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${value ? `bg-${accent}-50 border-${accent}-200` : 'bg-gray-50 border-transparent'}`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 bg-${accent}-100 rounded-xl flex items-center justify-center`}>
        <Icon size={18} className={`text-${accent}-600`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors ${value ? `bg-${accent}-600` : 'bg-gray-300'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  </div>
)

export default function AdminSettings() {
  const { liteMode, setLiteMode } = useApp()
  const [largeText, setLargeText] = useState(() => localStorage.getItem('cp_large_text') === 'true')
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('cp_contrast') === 'true')

  const handleLargeText = (v) => {
    setLargeText(v)
    localStorage.setItem('cp_large_text', v)
    document.documentElement.style.fontSize = v ? '18px' : ''
  }

  const handleHighContrast = (v) => {
    setHighContrast(v)
    localStorage.setItem('cp_contrast', v)
    document.body.classList.toggle('high-contrast', v)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Admin configuration and preferences</p>
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
