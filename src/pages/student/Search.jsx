import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MessageSquareWarning, FileText, Megaphone, Grid3X3 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { StatusBadge } from '../../components/ui/States'

const SERVICES = [
  { label: 'Attendance', to: '/student/attendance' }, { label: 'Timetable', to: '/student/timetable' },
  { label: 'Hostel', to: '/student/hostel' }, { label: 'Mess', to: '/student/mess' },
  { label: 'Complaints', to: '/student/complaints' }, { label: 'Leave', to: '/student/leave' },
  { label: 'Gate Pass', to: '/student/leave' }, { label: 'Documents', to: '/student/documents' },
  { label: 'Fees', to: '/student/fees' }, { label: 'Notifications', to: '/student/notifications' },
]

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const { user } = useAuth()
  const { complaints, requests, notices } = useApp()
  const navigate = useNavigate()

  const ql = q.toLowerCase()
  const matchComplaints = complaints.filter(c => c.student_id === user?.id && (c.id.toLowerCase().includes(ql) || c.description.toLowerCase().includes(ql) || c.category.toLowerCase().includes(ql)))
  const matchRequests = requests.filter(r => r.student_id === user?.id && (r.id.toLowerCase().includes(ql) || r.type.toLowerCase().includes(ql) || r.reason.toLowerCase().includes(ql)))
  const matchNotices = notices.filter(n => n.title.toLowerCase().includes(ql) || n.content.toLowerCase().includes(ql))
  const matchServices = SERVICES.filter(s => s.label.toLowerCase().includes(ql))
  const total = matchComplaints.length + matchRequests.length + matchNotices.length + matchServices.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
        <p className="text-gray-500 text-sm mt-1">{total} result{total !== 1 ? 's' : ''} for "<span className="font-medium text-gray-700">{q}</span>"</p>
      </div>

      {total === 0 && (
        <div className="card text-center py-12">
          <Search size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No results found for "{q}"</p>
          <p className="text-gray-400 text-sm mt-1">Try searching for complaints, documents, or services</p>
        </div>
      )}

      {matchComplaints.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MessageSquareWarning size={18} className="text-red-500" /> Complaints ({matchComplaints.length})</h2>
          <div className="space-y-2">
            {matchComplaints.map(c => (
              <button key={c.id} onClick={() => navigate('/student/complaints')} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                <div><p className="text-sm font-medium text-gray-900">{c.id} — {c.category}</p><p className="text-xs text-gray-500 truncate">{c.description}</p></div>
                <StatusBadge status={c.status} />
              </button>
            ))}
          </div>
        </div>
      )}

      {matchRequests.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileText size={18} className="text-blue-500" /> Documents ({matchRequests.length})</h2>
          <div className="space-y-2">
            {matchRequests.map(r => (
              <button key={r.id} onClick={() => navigate('/student/documents')} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                <div><p className="text-sm font-medium text-gray-900">{r.id} — {r.type}</p><p className="text-xs text-gray-500">{r.reason}</p></div>
                <StatusBadge status={r.status} />
              </button>
            ))}
          </div>
        </div>
      )}

      {matchNotices.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Megaphone size={18} className="text-orange-500" /> Notices ({matchNotices.length})</h2>
          <div className="space-y-2">
            {matchNotices.map(n => (
              <button key={n.id} onClick={() => navigate('/student/notifications')} className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-xs text-gray-500 line-clamp-1">{n.content}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {matchServices.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Grid3X3 size={18} className="text-purple-500" /> Services ({matchServices.length})</h2>
          <div className="flex flex-wrap gap-2">
            {matchServices.map(s => (
              <button key={s.label} onClick={() => navigate(s.to)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">{s.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
