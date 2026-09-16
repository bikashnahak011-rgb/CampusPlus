import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Building2, Edit2, Save, Loader2, Shield, X, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { supabase } from '../../lib/supabase'

const FIELD = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={13} className="text-gray-400" />
      <p className="text-xs text-gray-400 font-medium">{label}</p>
    </div>
    <p className={`text-sm font-semibold ${value ? 'text-gray-900' : 'text-gray-400 italic'}`}>
      {value || 'Not set'}
    </p>
  </div>
)

export default function AdminProfile() {
  const { user, fetchProfile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const isNewUser = !user?.profileComplete && !user?.department

  const [editing, setEditing] = useState(isNewUser)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || user?.user_metadata?.full_name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    designation: user?.designation || '',
    employee_id: user?.employee_id || '',
    office: user?.office || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (andGo = false) => {
    if (!form.name) { toast('Name is required', 'error'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: form.name,
        phone: form.phone,
        department: form.department,
        designation: form.designation,
        employee_id: form.employee_id,
        office: form.office,
        role: 'admin',
      })
      if (error) throw error
      await fetchProfile(user)
      toast('Profile saved!', 'success')
      setEditing(false)
      if (andGo) navigate('/admin/dashboard')
    } catch (e) {
      toast('Failed to save: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const avatar = user?.avatar_url || user?.user_metadata?.avatar_url

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Your administrator information</p>
        </div>
        {!isNewUser && (
          <div className="flex gap-2">
            {editing && (
              <button onClick={() => setEditing(false)} className="btn-secondary">
                <X size={15} /> Cancel
              </button>
            )}
            <button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving} className="btn-primary">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                : editing ? <><Save size={15} /> Save</>
                : <><Edit2 size={15} /> Edit</>}
            </button>
          </div>
        )}
      </div>

      {isNewUser && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">Welcome, Administrator! 🛡</p>
              <p className="text-indigo-200 text-sm">Please complete your profile to access the dashboard.</p>
            </div>
          </div>
        </div>
      )}

      <div className="card animate-scale-in">
        <div className="flex items-center gap-5 mb-6">
          <div>
            {avatar
              ? <img src={avatar} alt={user?.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-100" />
              : <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black ring-4 ring-indigo-100">
                  {(form.name || user?.name)?.[0]?.toUpperCase() || 'A'}
                </div>
            }
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{form.name || user?.name || 'Administrator'}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="badge bg-indigo-100 text-indigo-700 text-xs">🛡 Admin</span>
              {form.designation && <span className="badge bg-purple-100 text-purple-700 text-xs">{form.designation}</span>}
            </div>
          </div>
        </div>

        {!editing ? (
          <div className="grid sm:grid-cols-2 gap-3">
            <FIELD icon={User} label="Full Name" value={user?.name} />
            <FIELD icon={Shield} label="Designation" value={user?.designation} />
            <FIELD icon={Building2} label="Department" value={user?.department} />
            <FIELD icon={Building2} label="Office" value={user?.office} />
            <FIELD icon={User} label="Employee ID" value={user?.employee_id} />
            <FIELD icon={Phone} label="Phone" value={user?.phone} />
            <FIELD icon={Mail} label="Email" value={user?.email} />
          </div>
        ) : (
          <div className="space-y-4">
            {isNewUser && (
              <p className="text-xs text-indigo-600 bg-indigo-50 rounded-xl px-3 py-2 font-medium">
                ✏️ Fill in your administrator details below.
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" className="input text-sm" />
              </div>
              {[
                { key: 'designation', label: 'Designation', placeholder: 'e.g. HOD, Warden, Dean' },
                { key: 'department', label: 'Department', placeholder: 'e.g. Computer Science' },
                { key: 'employee_id', label: 'Employee ID', placeholder: 'e.g. EMP2021' },
                { key: 'office', label: 'Office / Block', placeholder: 'e.g. Admin Block, Room 101' },
                { key: 'phone', label: 'Phone', placeholder: 'e.g. 9876543210' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="input text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary flex-1 justify-center py-3" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 15px rgba(79,70,229,0.4)' }}>
                {saving
                  ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  : <><CheckCircle2 size={16} /> Save & Go to Dashboard</>}
              </button>
              <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary px-4">
                Save Only
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
