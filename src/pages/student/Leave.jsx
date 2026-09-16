import { useState } from 'react'
import { Plus, Loader2, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { StatusBadge, EmptyState } from '../../components/ui/States'

const EMPTY = { type: 'Gate Pass', reason: '', destination: '', from_date: '', from_time: '', to_date: '', to_time: '' }

export default function LeavePage() {
  const { user } = useAuth()
  const { leaveRequests, submitLeave } = useApp()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [detail, setDetail] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [tab, setTab] = useState('All')

  const myLeave = leaveRequests.filter(l => l.student_id === user?.id)
  const filtered = tab === 'All' ? myLeave : myLeave.filter(l => l.type === tab)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.reason || !form.destination || !form.from_date || !form.to_date) { toast('Please fill all required fields.', 'warning'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 700))
    const id = submitLeave(form, user.id, user.name)
    setSubmitting(false)
    setShowForm(false)
    setForm(EMPTY)
    toast(`✓ ${form.type} ${id} submitted successfully.`, 'success')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Leave & Gate Pass</h1><p className="text-gray-500 text-sm mt-1">Manage your leave and gate pass requests</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={18} /> New Request</button>
      </div>

      <div className="card">
        <div className="flex gap-2 mb-4">
          {['All', 'Leave', 'Gate Pass'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
          ))}
        </div>
        {filtered.length === 0 ? <EmptyState message="No requests found." /> : (
          <div className="space-y-3">
            {filtered.map(l => (
              <button key={l.id} onClick={() => setDetail(l)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-blue-600 font-semibold">{l.id}</span>
                    <span className="badge bg-gray-100 text-gray-600 text-xs">{l.type}</span>
                    <StatusBadge status={l.status} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{l.reason}</p>
                  <p className="text-xs text-gray-500 mt-0.5">To: {l.destination} • {l.from_date} → {l.to_date}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Request" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Request Type</label>
            <div className="flex gap-3">
              {['Gate Pass', 'Leave'].map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${form.type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason *</label>
            <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Reason for leave/gate pass" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination *</label>
            <input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="Where are you going?" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Leaving Date *</label><input type="date" value={form.from_date} onChange={e => setForm(f => ({ ...f, from_date: e.target.value }))} className="input" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Leaving Time</label><input type="time" value={form.from_time} onChange={e => setForm(f => ({ ...f, from_time: e.target.value }))} className="input" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Return Date *</label><input type="date" value={form.to_date} onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))} className="input" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Return Time</label><input type="time" value={form.to_time} onChange={e => setForm(f => ({ ...f, to_time: e.target.value }))} className="input" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`${detail?.type} — ${detail?.id}`}>
        {detail && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[['Type', detail.type], ['Status', <StatusBadge key="s" status={detail.status} />], ['Reason', detail.reason], ['Destination', detail.destination], ['From', `${detail.from_date} ${detail.from_time}`], ['To', `${detail.to_date} ${detail.to_time}`]].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="text-sm font-medium text-gray-800">{v}</p></div>
              ))}
            </div>
            {detail.admin_comment && <div className="bg-blue-50 rounded-xl p-3"><p className="text-xs text-blue-600 font-medium mb-1">Admin Comment</p><p className="text-sm text-gray-800">{detail.admin_comment}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  )
}
