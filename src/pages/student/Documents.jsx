import { useState } from 'react'
import { Plus, Download, Loader2, ChevronRight, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { StatusBadge, EmptyState } from '../../components/ui/States'

const DOC_TYPES = ['Bonafide Certificate', 'Character Certificate', 'Fee Receipt', 'ID Card', 'Migration Certificate', 'Other']

export default function DocumentsPage() {
  const { user } = useAuth()
  const { requests, submitRequest } = useApp()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [detail, setDetail] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ type: '', reason: '' })

  const myRequests = requests.filter(r => r.student_id === user?.id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.type || !form.reason) { toast('Please fill all fields.', 'warning'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 700))
    const id = submitRequest(form, user.id, user.name)
    setSubmitting(false)
    setShowForm(false)
    setForm({ type: '', reason: '' })
    toast(`✓ Request ${id} submitted successfully.`, 'success')
  }

  const statusFlow = ['Submitted', 'Under Review', 'Approved', 'Ready']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Documents</h1><p className="text-gray-500 text-sm mt-1">Request and track your documents</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={18} /> New Request</button>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">My Document Requests</h2>
        {myRequests.length === 0 ? <EmptyState message="No document requests yet." icon={FileText} /> : (
          <div className="space-y-3">
            {myRequests.map(r => (
              <button key={r.id} onClick={() => setDetail(r)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-blue-600 font-semibold">{r.id}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{r.type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.reason} • {new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {r.file_url && r.status === 'Approved' && (
                    <a href={r.file_url} onClick={e => e.stopPropagation()} className="btn-success py-1.5 px-3 text-xs"><Download size={14} /> Download</a>
                  )}
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Request Document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type *</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input">
              <option value="">Select document type</option>
              {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason / Purpose *</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} placeholder="Why do you need this document?" className="input resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Request ${detail?.id}`}>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[['Document Type', detail.type], ['Status', <StatusBadge key="s" status={detail.status} />], ['Reason', detail.reason], ['Submitted', new Date(detail.created_at).toLocaleDateString('en-IN')]].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="text-sm font-medium text-gray-800">{v}</p></div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Progress</p>
              <div className="flex items-center gap-2">
                {statusFlow.map((s, i) => {
                  const idx = statusFlow.indexOf(detail.status)
                  const done = i <= idx
                  return (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`flex flex-col items-center flex-1 ${i > 0 ? '' : ''}`}>
                        {i > 0 && <div className={`h-0.5 w-full mb-2 ${done ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
                        <p className={`text-xs mt-1 text-center ${done ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{s}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {detail.admin_comment && <div className="bg-blue-50 rounded-xl p-3"><p className="text-xs text-blue-600 font-medium mb-1">Admin Comment</p><p className="text-sm text-gray-800">{detail.admin_comment}</p></div>}
            {detail.file_url && detail.status === 'Approved' && (
              <a href={detail.file_url} className="btn-success w-full justify-center"><Download size={16} /> Download Document</a>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
