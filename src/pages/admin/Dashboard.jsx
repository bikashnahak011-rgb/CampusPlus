import { useNavigate } from 'react-router-dom'
import { Users, MessageSquareWarning, ClipboardList, Clock, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { StatusBadge } from '../../components/ui/States'

export default function AdminDashboard() {
  const { complaints, requests, leaveRequests, students } = useApp()
  const navigate = useNavigate()

  const openComplaints = complaints.filter(c => !['Resolved', 'Closed'].includes(c.status))
  const pendingReqs = [...requests.filter(r => !['Approved', 'Rejected'].includes(r.status)), ...leaveRequests.filter(l => l.status === 'Pending')]
  const highPriority = complaints.filter(c => c.priority === 'High' && !['Resolved', 'Closed'].includes(c.status))

  const recentComplaints = complaints.slice(0, 5)
  const recentRequests = pendingReqs.slice(0, 5)

  const stats = [
    { label: 'Total Students', value: '4,280', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: '+12 this month' },
    { label: 'Pending Requests', value: pendingReqs.length + 120, icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50', change: `${pendingReqs.length} new today` },
    { label: 'Open Complaints', value: openComplaints.length + 33, icon: MessageSquareWarning, color: 'text-red-600', bg: 'bg-red-50', change: `${highPriority.length} high priority` },
    { label: 'Avg Resolution Time', value: '4.2 hrs', icon: Clock, color: 'text-green-600', bg: 'bg-green-50', change: '↓ 0.8 hrs from last week' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Campus overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, change }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}><Icon size={20} className={color} /></div>
              <TrendingUp size={14} className="text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-green-600 mt-1">{change}</p>
          </div>
        ))}
      </div>

      {highPriority.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2"><AlertCircle size={18} className="text-red-600" /><p className="font-semibold text-red-800">🚨 {highPriority.length} High Priority Complaint{highPriority.length > 1 ? 's' : ''} Need Attention</p></div>
          <div className="flex flex-wrap gap-2">
            {highPriority.map(c => (
              <button key={c.id} onClick={() => navigate('/admin/complaints')} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-xl hover:bg-red-200 transition-colors">{c.id} — {c.category}</button>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Complaints</h2>
            <button onClick={() => navigate('/admin/complaints')} className="text-blue-600 text-xs hover:underline flex items-center gap-1">View All <ChevronRight size={14} /></button>
          </div>
          <div className="space-y-3">
            {recentComplaints.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs text-blue-600 font-semibold">{c.id}</span>
                    <span className={`badge text-xs ${c.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.priority}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{c.category}</p>
                  <p className="text-xs text-gray-500">{c.student_name}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pending Requests</h2>
            <button onClick={() => navigate('/admin/requests')} className="text-blue-600 text-xs hover:underline flex items-center gap-1">View All <ChevronRight size={14} /></button>
          </div>
          <div className="space-y-3">
            {recentRequests.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No pending requests</p> : recentRequests.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="font-mono text-xs text-blue-600 font-semibold">{r.id}</span>
                  <p className="text-sm font-medium text-gray-900">{r.type}</p>
                  <p className="text-xs text-gray-500">{r.student_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <button onClick={() => navigate('/admin/requests')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Manage Complaints', to: '/admin/complaints', color: 'bg-red-50 text-red-600 hover:bg-red-100' },
            { label: 'Review Requests', to: '/admin/requests', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
            { label: 'Post Notice', to: '/admin/notices', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
            { label: 'View Analytics', to: '/admin/analytics', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
          ].map(({ label, to, color }) => (
            <button key={label} onClick={() => navigate(to)} className={`${color} rounded-xl p-4 text-sm font-medium transition-colors text-center`}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
