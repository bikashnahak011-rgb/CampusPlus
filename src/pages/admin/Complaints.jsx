import { useState } from 'react'
import { Search, Filter, Loader2 } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { StatusBadge, EmptyState } from '../../components/ui/States'

const FILTERS = ['All', 'High Priority', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed']
const STATUSES = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed']
const STAFF = ['Ravi Plumbing Team', 'Electrical Team', 'Housekeeping Team', 'Maintenance Team', 'Academic Staff']

export default function AdminComplaints() {
  const { complaints, updateComplaint } = useApp()
  const toast = useToast()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [actionForm, setActionForm] = useState({ status: '', note: '', assignedTo: '' })

  const filtered = complaints.filter(c => {
    const mf = filter === 'All' ? true : filter === 'High Priority' ? c.priority === 'High' : c.status === filter
    const ms = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.student_name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  const openDetail = (c) => {
    setDetail(c)
    setActionForm({ status: c.status, note: '', assignedTo: c.assigned_to || '' })
  }

  const handleUpdate = async () => {
    if (!actionForm.note.trim()) { toast('Please add a note.', 'warning'); return }
    setUpdating(true)
    await new Promise(r => setTimeout(r, 600))
    updateComplaint(detail.id, actionForm.status, actionForm.note, actionForm.assignedTo || null)
    setUpdating(false)
    setDetail(null)
    toast(`✓ Complaint ${detail.id} updated to: ${actionForm.status}`, 'success')
  }

  const quickUpdate = async (c, status, note) => {
    await new Promise(r => setTimeout(r, 300))
    updateComplaint(c.id, status, note)
    toast(`✓ ${c.id} → ${status}`, 'success')
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1><p className="text-gray-500 text-sm mt-1">{complaints.length} total complaints</p></div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, student, category..." className="input pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {filtered.length === 0 ? <EmptyState message="No complaints found." icon={Filter} /> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">{['ID', 'Student', 'Category', 'Priority', 'Location', 'Status', 'Date', 'Actions'].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs text-blue-600 font-semibold">{c.id}</td>
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{c.student_name}</td>
                  <td className="py-3 px-4 text-gray-700">{c.category}</td>
                  <td className="py-3 px-4"><span className={`badge text-xs ${c.priority === 'High' ? 'bg-red-100 text-red-700' : c.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{c.priority}</span></td>
                  <td className="py-3 px-4 text-gray-500 text-xs max-w-[150px] truncate">{c.location}</td>
                  <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                  <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openDetail(c)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">View</button>
                      {c.status === 'Submitted' && <button onClick={() => quickUpdate(c, 'Assigned', 'Assigned to maintenance team')} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-100">Assign</button>}
                      {c.status === 'Assigned' && <button onClick={() => quickUpdate(c, 'In Progress', 'Work started')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">Start</button>}
                      {c.status === 'In Progress' && <button onClick={() => quickUpdate(c, 'Resolved', 'Issue resolved')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100">Resolve</button>}
                      {c.status === 'Resolved' && <button onClick={() => quickUpdate(c, 'Closed', 'Complaint closed')} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-200">Close</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Manage Complaint ${detail?.id}`} size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[['Student', detail.student_name], ['Category', detail.category], ['Priority', detail.priority], ['Location', detail.location], ['Current Status', <StatusBadge key="s" status={detail.status} />], ['Department', detail.department || 'Unassigned']].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="text-sm font-medium text-gray-800">{v}</p></div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Description</p><p className="text-sm text-gray-800">{detail.description}</p></div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Update Complaint</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">New Status</label>
                  <select value={actionForm.status} onChange={e => setActionForm(f => ({ ...f, status: e.target.value }))} className="input text-sm">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Assign To</label>
                  <select value={actionForm.assignedTo} onChange={e => setActionForm(f => ({ ...f, assignedTo: e.target.value }))} className="input text-sm">
                    <option value="">Select staff</option>
                    {STAFF.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Internal Note *</label>
                <textarea value={actionForm.note} onChange={e => setActionForm(f => ({ ...f, note: e.target.value }))} rows={2} placeholder="Add a note about this update..." className="input resize-none text-sm" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDetail(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={handleUpdate} disabled={updating} className="btn-primary flex-1 justify-center">
                  {updating ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Update Complaint'}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Timeline</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {detail.updates?.map((u, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0" />
                    <div><span className="font-medium text-gray-800">{u.status}</span> — <span className="text-gray-500">{u.note}</span><p className="text-gray-400">{new Date(u.time).toLocaleString('en-IN')}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
