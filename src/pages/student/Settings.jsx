import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { Zap, Bell, Eye, Moon, Globe, Shield } from 'lucide-react'

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

export default function SettingsPage() {
  const { liteMode, setLiteMode } = useApp()
  const [notifications, setNotifications] = useState(() => localStorage.getItem('cp_notif') !== 'false')
  const [largeText, setLargeText] = useState(() => localStorage.getItem('cp_large_text') === 'true')
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('cp_contrast') === 'true')
  const [regionalLang, setRegionalLang] = useState(() => localStorage.getItem('cp_lang') === 'true')

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

  const handleNotifications = (v) => {
    setNotifications(v)
    localStorage.setItem('cp_notif', v)
    if (v && 'Notification' in window) Notification.requestPermission()
  }

  const handleRegionalLang = (v) => {
    setRegionalLang(v)
    localStorage.setItem('cp_lang', v)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Customize your CampusPlus experience</p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900 mb-2">Performance</h2>
        <Toggle
          value={liteMode} onChange={setLiteMode}
          label="⚡ Lite Mode" desc="Reduces animations, faster on slow networks"
          icon={Zap} accent="yellow"
        />
        {liteMode && <p className="text-xs text-yellow-700 bg-yellow-50 rounded-xl p-3">⚡ Lite Mode is active. Animations and transitions are disabled.</p>}
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900 mb-2">Notifications</h2>
        <Toggle
          value={notifications} onChange={handleNotifications}
          label="Push Notifications" desc="Get notified about complaints and requests"
          icon={Bell} accent="blue"
        />
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
        <Toggle
          value={regionalLang} onChange={handleRegionalLang}
          label="Regional Language" desc="Switch to your preferred language (coming soon)"
          icon={Globe} accent="purple"
        />
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Security</h2>
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl">
          <Shield size={20} className="text-green-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Account Secured</p>
            <p className="text-xs text-gray-500">Your account is protected with Supabase Auth + Google OAuth</p>
          </div>
        </div>
      </div>
    </div>
  )
}
