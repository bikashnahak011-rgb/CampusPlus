import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, BookOpen, Building2, Edit2, Save, Loader2, Hash, Users, GitBranch, GraduationCap, Home, X, CheckCircle2, Heart } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { supabase } from '../../lib/supabase'

const FIELD = ({ icon: Icon, label, value, tone = 'violet' }) => {
  const tones = {
    violet: 'bg-violet-50 border-violet-100 text-violet-600',
    blue: 'bg-sky-50 border-sky-100 text-sky-600',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    pink: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-600',
  }
  return (
  <div className={`rounded-xl border p-3 ${tones[tone] || tones.violet}`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={13} className="opacity-80" />
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
    <p className={`text-sm font-semibold ${value ? 'text-slate-800' : 'text-slate-400 italic'}`}>
      {value || 'Not set'}
    </p>
  </div>
  )
}

export default function ProfilePage() {
  const { user, fetchProfile, updateDemoProfile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const isNewUser = !user?.roll_no && !user?.profileComplete

  const [editing, setEditing] = useState(isNewUser)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || user?.user_metadata?.full_name || '',
    phone: user?.phone || '',
    father_name: user?.father_name || '',
    father_mobile: user?.father_mobile || '',
    blood_group: user?.blood_group || '',
    tenth_result: user?.tenth_result || '',
    twelfth_result: user?.twelfth_result || '',
    roll_no: user?.roll_no || '',
    department: user?.department || '',
    branch: user?.branch || '',
    section: user?.section || '',
    gender: user?.gender || '',
    year: user?.year || '',
    semester: user?.semester || '',
    hostel_block: user?.hostel_block || '',
    room_number: user?.room_number || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (andGo = false) => {
    if (!form.roll_no) { toast('Roll number is required', 'error'); return }
    setSaving(true)
    try {
      const profileUpdates = {
        name: form.name,
        phone: form.phone,
        father_name: form.father_name,
        father_mobile: form.father_mobile,
        blood_group: form.blood_group,
        tenth_result: form.tenth_result,
        twelfth_result: form.twelfth_result,
        roll_no: form.roll_no,
        department: form.department,
        branch: form.branch,
        section: form.section,
        gender: form.gender,
        year: form.year ? parseInt(form.year) : null,
        semester: form.semester ? parseInt(form.semester) : null,
        hostel_block: form.hostel_block,
        room_number: form.room_number,
      }
      if (user?.isDemo) {
        updateDemoProfile(profileUpdates)
      } else {
        const { data, error } = await supabase.from('profiles').update(profileUpdates).eq('id', user.id).select('id').maybeSingle()
        if (error) throw error
        if (!data) throw new Error('Profile record is missing. Contact your campus administrator.')
        await fetchProfile(user)
      }
      toast('Profile saved!', 'success')
      setEditing(false)
      if (andGo) navigate('/student/dashboard')
    } catch (e) {
      toast('Failed to save: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const avatar = user?.avatar_url || user?.user_metadata?.avatar_url

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Your personal & academic information</p>
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

      {/* New user welcome banner */}
      {isNewUser && (
        <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-900/15 animate-scale-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">Welcome to CampusOne! 👋</p>
              <p className="text-violet-100 text-sm">Please complete your profile to get started.</p>
            </div>
          </div>
        </div>
      )}

      {/* Avatar + name card */}
      <div className="card overflow-hidden border border-violet-200/80 bg-gradient-to-br from-white via-violet-50/80 to-fuchsia-50/70 shadow-[0_18px_55px_rgba(91,33,182,0.10)] animate-scale-in">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            {avatar
              ? <img src={avatar} alt={user?.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-violet-100" />
              : <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black ring-4 ring-violet-100 shadow-lg shadow-violet-300/40">
                  {(form.name || user?.name)?.[0]?.toUpperCase() || 'S'}
                </div>
            }
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{form.name || user?.name || 'Student'}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="badge bg-blue-100 text-blue-700 text-xs">🎓 Student</span>
              {form.roll_no && <span className="badge bg-gray-100 text-gray-600 text-xs">#{form.roll_no}</span>}
              {form.section && <span className="badge bg-green-100 text-green-700 text-xs">Section {form.section}</span>}
            </div>
          </div>
        </div>

        {!editing ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <FIELD icon={Hash} label="Roll Number" value={user?.roll_no} tone="violet" />
            <FIELD icon={GitBranch} label="Branch" value={user?.branch} tone="pink" />
            <FIELD icon={BookOpen} label="Department" value={user?.department} tone="blue" />
            <FIELD icon={Users} label="Section" value={user?.section} tone="green" />
            <FIELD icon={User} label="Gender" value={user?.gender} tone="pink" />
            <FIELD icon={GraduationCap} label="Year / Semester" value={user?.year ? `Year ${user.year}, Sem ${user.semester}` : null} tone="violet" />
            <FIELD icon={Home} label="Hostel Block" value={user?.hostel_block ? `Block ${user.hostel_block}` : null} tone="green" />
            <FIELD icon={Building2} label="Room Number" value={user?.room_number} tone="blue" />
            <FIELD icon={Phone} label="Phone" value={user?.phone} tone="blue" />
            <FIELD icon={User} label="Father's Name" value={user?.father_name} tone="violet" />
            <FIELD icon={Phone} label="Father's Mobile" value={user?.father_mobile} tone="green" />
            <FIELD icon={Heart} label="Blood Group" value={user?.blood_group} tone="pink" />
            <FIELD icon={GraduationCap} label="10th Result" value={user?.tenth_result} tone="amber" />
            <FIELD icon={GraduationCap} label="12th Result" value={user?.twelfth_result} tone="amber" />
            <FIELD icon={Mail} label="Email" value={user?.email} tone="violet" />
          </div>
        ) : (
          <div className="space-y-4">
            {isNewUser && (
            <p className="text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2 font-medium">
                ✏️ Fill in your details below. Roll number is required.
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" className="input text-sm focus:border-violet-400 focus:ring-violet-200" />
              </div>
              {[
                { key: 'roll_no', label: 'Roll Number *', placeholder: 'e.g. CS2021047' },
                { key: 'branch', label: 'Branch', placeholder: 'e.g. B.Tech CSE' },
                { key: 'department', label: 'Department', placeholder: 'e.g. Computer Science' },
                { key: 'section', label: 'Section', placeholder: 'e.g. A' },
                { key: 'year', label: 'Year', placeholder: 'e.g. 3', type: 'number' },
                { key: 'semester', label: 'Semester', placeholder: 'e.g. 6', type: 'number' },
                { key: 'hostel_block', label: 'Hostel Block', placeholder: 'e.g. A' },
                { key: 'room_number', label: 'Room Number', placeholder: 'e.g. 203' },
                { key: 'phone', label: 'Phone', placeholder: 'e.g. 9876543210' },
                { key: 'father_name', label: "Father's Name", placeholder: 'Enter father’s name' },
                { key: 'father_mobile', label: "Father's Mobile Number", placeholder: 'e.g. 9876543210', type: 'tel' },
                { key: 'tenth_result', label: '10th Result', placeholder: 'e.g. 88% or 440 / 500' },
                { key: 'twelfth_result', label: '12th Result', placeholder: 'e.g. 85% or 425 / 500' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type={type || 'text'}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="input text-sm focus:border-violet-400 focus:ring-violet-200"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Blood Group</label>
                <select value={form.blood_group} onChange={e => set('blood_group', e.target.value)} className="input text-sm focus:border-violet-400 focus:ring-violet-200">
                  <option value="">Select blood group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => <option key={group} value={group}>{group}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)} className="input text-sm focus:border-violet-400 focus:ring-violet-200">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Save buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary-glow flex-1 justify-center py-3">
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
