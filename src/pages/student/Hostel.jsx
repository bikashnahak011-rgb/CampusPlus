import { useNavigate } from 'react-router-dom'
import { Phone, User, Droplets, Zap, Sparkles, Wrench, AlertCircle, Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { StatusBadge } from '../../components/ui/States'
import { DEMO_HOSTEL } from '../../data/demoData'

const SERVICES = [
  { icon: Droplets, label: 'Water Supply', status: 'Issue Reported', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Zap, label: 'Electricity', status: 'Working', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { icon: Sparkles, label: 'Cleaning', status: 'Working', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: Wrench, label: 'Maintenance', status: 'Working', color: 'text-purple-600', bg: 'bg-purple-50' },
]

export default function HostelPage() {
  const { user } = useAuth()
  const { complaints } = useApp()
  const navigate = useNavigate()
  const activeComplaints = complaints.filter(c => c.student_id === user?.id && !['Resolved', 'Closed'].includes(c.status))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Hostel</h1><p className="text-gray-500 text-sm mt-1">Your hostel information and services</p></div>
        <button onClick={() => navigate('/student/complaints')} className="btn-primary"><Plus size={18} /> Report Hostel Problem</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Room Information</h2>
          <div className="grid grid-cols-2 gap-3">
            {[['Hostel Block', `Block ${DEMO_HOSTEL.block}`], ['Room Number', DEMO_HOSTEL.room], ['Floor', `Floor ${DEMO_HOSTEL.floor}`], ['Capacity', '3 Students']].map(([l, v]) => (
              <div key={l} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="font-semibold text-gray-900">{v}</p></div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Warden Information</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><User size={22} className="text-blue-600" /></div>
            <div><p className="font-semibold text-gray-900">{DEMO_HOSTEL.warden}</p><p className="text-xs text-gray-500">Block {DEMO_HOSTEL.block} Warden</p></div>
          </div>
          <a href={`tel:${DEMO_HOSTEL.warden_phone}`} className="flex items-center gap-2 text-blue-600 text-sm hover:underline"><Phone size={15} />{DEMO_HOSTEL.warden_phone}</a>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Roommates</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {DEMO_HOSTEL.roommates.map(r => (
            <div key={r.roll} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">{r.name[0]}</div>
              <div><p className="font-medium text-gray-900 text-sm">{r.name}</p><p className="text-xs text-gray-500">{r.roll}</p></div>
              <a href={`tel:${r.phone}`} className="ml-auto text-blue-600"><Phone size={15} /></a>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Hostel Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVICES.map(({ icon: Icon, label, status, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
              <Icon size={24} className={`${color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className={`text-xs mt-1 ${status === 'Working' ? 'text-green-600' : 'text-orange-600'}`}>{status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Active Complaints</h2>
        {activeComplaints.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No active complaints</p>
        ) : (
          <div className="space-y-2">
            {activeComplaints.map(c => (
              <button key={c.id} onClick={() => navigate('/student/complaints')} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.category} — {c.id}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><AlertCircle size={11} />{c.location}</p>
                </div>
                <StatusBadge status={c.status} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
