import { useState } from 'react'
import { Plus, Download, Loader2, ChevronRight, FileText, FileCheck2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { StatusBadge, EmptyState } from '../../components/ui/States'
import { supabase } from '../../lib/supabase'
import { INITIAL_REQUESTS } from '../../data/demoData'
import SamplePreviewNotice from '../../components/ui/SamplePreviewNotice'

const DOCUMENT_BUCKET = 'document-requests'

const DOC_TYPES = ['Bonafide Certificate', 'Character Certificate', 'Fee Receipt', 'ID Card', 'Migration Certificate', 'Other']

export default function DocumentsPage() {
  const { user } = useAuth()
  const { requests, submitRequest } = useApp()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [detail, setDetail] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [downloadingId, setDownloadingId] = useState('')
  const [form, setForm] = useState({ type: '', reason: '' })

  const liveRequests = requests.filter(r => r.student_id === user?.id)
  const samplePreview = !user?.isDemo && liveRequests.length === 0
  const myRequests = samplePreview
    ? INITIAL_REQUESTS.filter(r => r.student_id === 'stu-001').map(r => ({ ...r, id: `sample-${r.id}`, demo_sample: true }))
    : liveRequests

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.type || !form.reason) { toast('Please fill all fields.', 'warning'); return }
    setSubmitting(true)
    try {
      const id = await submitRequest(form, user.id, user.name)
      setShowForm(false)
      setForm({ type: '', reason: '' })
      toast(`Request ${id} submitted successfully.`, 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const downloadDocument = async request => {
    if (!request.file_url || downloadingId) return
    if (!supabase) {
      toast('Document downloads require a configured campus account.', 'error')
      return
    }

    setDownloadingId(request.id)
    try {
      const { data, error } = await supabase.storage.from(DOCUMENT_BUCKET).download(request.file_url)
      if (error) throw error
      const objectUrl = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${request.type.replace(/[^a-zA-Z0-9_-]/g, '_')}-${request.id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch (error) {
      toast(error.message || 'The document could not be downloaded.', 'error')
    } finally {
      setDownloadingId('')
    }
  }

  const statusFlow = ['Submitted', 'Under Review', 'Approved', 'Ready']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Documents</h1><p className="text-gray-500 text-sm mt-1">Request and track your documents</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={18} /> New Request</button>
      </div>

      {samplePreview && <SamplePreviewNotice>These document requests are examples only. New requests you submit are saved to your account.</SamplePreviewNotice>}

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">My Document Requests</h2>
        {myRequests.length === 0 ? <EmptyState message="No document requests yet." icon={FileText} /> : (
          <div className="space-y-3">
            {myRequests.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/70 to-white p-4 transition-colors hover:border-violet-200 hover:from-violet-50">
                <button type="button" onClick={() => setDetail(r)} className="min-w-0 flex-1 text-left">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-blue-600">{r.id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{r.type}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{r.reason} • {new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  {r.file_url && ['Approved', 'Ready'].includes(r.status) && (
                    <button type="button" onClick={() => downloadDocument(r)} disabled={!!downloadingId} className="btn-success px-3 py-1.5 text-xs disabled:opacity-60">
                      {downloadingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      <span className="hidden sm:inline">{downloadingId === r.id ? 'Downloading' : 'Download PDF'}</span>
                    </button>
                  )}
                  <button type="button" aria-label={`View request ${r.id}`} onClick={() => setDetail(r)} className="rounded-lg p-2 text-gray-400 hover:bg-violet-100 hover:text-violet-700">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
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
            {detail.file_url && ['Approved', 'Ready'].includes(detail.status) && (
              <button type="button" onClick={() => downloadDocument(detail)} disabled={!!downloadingId} className="btn-success w-full justify-center disabled:opacity-60">
                {downloadingId === detail.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Download Document PDF
              </button>
            )}
            {detail.status === 'Approved' && !detail.file_url && <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><FileCheck2 size={17} className="mt-0.5 shrink-0" /><p>Your request is approved. The document PDF will appear here once it has been uploaded by the administration.</p></div>}
          </div>
        )}
      </Modal>
    </div>
  )
}
