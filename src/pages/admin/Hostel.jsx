import { useNavigate } from 'react-router-dom'
import { Building2, Users, AlertCircle } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { StatusBadge } from '../../components/ui/States'

const BLOCKS = [
  { block: 'A', rooms: 120, occupied: 108, complaints: 0 },
  { block: 'B', rooms: 100, occupied: 92, complaints: 0 },
  { block: 'C', rooms: 80, occupied: 71, complaints: 0 },
]

export default function AdminHostel() {
  const { complaints } = useApp()
  const navigate = useNavigate()

  const blockComplaints = (block) => complaints.filter(c => c.location?.includes(`Block ${block}`) && !['Resolved','Closed'].includes(c.status))

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1><p className="text-gray-500 text-sm mt-1">Overview of all hostel blocks</p></div>

      <div className="grid sm:grid-cols-3 gap-4">
        {BLOCKS.map(b => {
          const bc = blockComplaints(b.block)
          return (
            <div key={b.block} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Building2 size={20} className="text-blue-600" /></div>
                {bc.length > 0 && <span className="badge bg-red-100 text-red-700 text-xs">{bc.length} issues</span>}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Block {b.block}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <div className="flex justify-between"><span>Rooms</span><span className="font-medium text-gray-900">{b.rooms}</span></div>
                <div className="flex justify-between"><span>Occupied</span><span className="font-medium text-gray-900">{b.occupied}</span></div>
                <div className="flex justify-between"><span>Vacant</span><span className="font-medium text-green-600">{b.rooms - b.occupied}</span></div>
              </div>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.round(b.occupied/b.rooms*100)}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.round(b.occupied/b.rooms*100)}% occupancy</p>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Active Hostel Complaints</h2>
          <button onClick={() => navigate('/admin/complaints')} className="text-blue-600 text-xs hover:underline">View All</button>
        </div>
        {complaints.filter(c => !['Resolved','Closed'].includes(c.status)).length === 0
          ? <p className="text-gray-400 text-sm text-center py-6">No active complaints</p>
          : (
            <div className="space-y-2">
              {complaints.filter(c => !['Resolved','Closed'].includes(c.status)).map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs text-blue-600 font-semibold">{c.id}</span>
                      <span className={`badge text-xs ${c.priority==='High'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{c.priority}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{c.category} — {c.location}</p>
                    <p className="text-xs text-gray-500">{c.student_name}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
