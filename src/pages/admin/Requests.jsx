import { useState } from 'react'
import { Search, Loader2, FileUp, FileCheck2 } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { StatusBadge, EmptyState } from '../../components/ui/States'
import { supabase } from '../../lib/supabase'

const DOCUMENT_BUCKET = 'document-requests'
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024

export default function AdminRequests() {
  const { requests, leaveRequests, updateRequest, updateLeave } = useApp()
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('Documents')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailType, setDetailType] = useState('doc')
  const [comment, setComment] = useState('')
  const [updating, setUpdating] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)

  const allDocs = requests.filter(r => !['approved', 'ready'].includes(r.status?.toLowerCase()))
    .filter(r => !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.student_name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()))
  const approvedDocs = requests.filter(r => r.status?.toLowerCase() === 'approved' && !r.file_url)
    .filter(r => !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.student_name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()))
  const allLeave = leaveRequests.filter(l => l.status?.toLowerCase() !== 'approved')
    .filter(l => !search || l.id.toLowerCase().includes(search.toLowerCase()) || l.student_name.toLowerCase().includes(search.toLowerCase()))

  const openDoc = (r) => { setDetail(r); setDetailType('doc'); setComment(r.admin_comment || '') }
  const openLeave = (l) => { setDetail(l); setDetailType('leave'); setComment(l.admin_comment || '') }

  const applyDecision = async (request, type, action, note = '') => {
    if (!request) return
    setUpdating(true)
    try {
      if (type === 'doc') {
        await updateRequest(request.id, action, note)
      } else {
        await updateLeave(request.id, action, note)
      }
      if (detail?.id === request.id) setDetail(null)
      toast(`${request.id} ${action.toLowerCase()}.`, action === 'Approved' ? 'success' : 'info')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleAction = action => applyDecision(detail, detailType, action, comment)

  const uploadApprovedDocument = async event => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file || !detail || detailType !== 'doc') return
    if (detail.status?.toLowerCase() !== 'approved') {
      toast('Approve this request before attaching its document.', 'warning')
      return
    }
    if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf')) {
      toast('Choose a PDF file to provide to the student.', 'warning')
      return
    }
    if (file.size > MAX_DOCUMENT_SIZE) {
      toast('PDF files must be 10 MB or smaller.', 'warning')
      return
    }
    if (await file.slice(0, 5).text() !== '%PDF-') {
      toast('The selected file is not a valid PDF.', 'warning')
      return
    }
    if (!supabase || user?.isDemo) {
      toast('PDF uploads require a configured campus account and document storage.', 'error')
      return
    }

    setUploadingDocument(true)
    let uploadedPath = null
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      uploadedPath = `${detail.student_id}/${detail.id}/${crypto.randomUUID()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from(DOCUMENT_BUCKET).upload(uploadedPath, file, {
        cacheControl: '3600',
        contentType: 'application/pdf',
        upsert: false,
      })
      if (uploadError) throw uploadError

      await updateRequest(
        detail.id,
        'Ready',
        comment.trim() || detail.admin_comment || 'Approved document is ready for download.',
        uploadedPath
      )
      setDetail(null)
      toast('PDF uploaded. The document is now available to the student.', 'success')
    } catch (error) {
      if (uploadedPath) {
        try {
          const { error: cleanupError } = await supabase.storage.from(DOCUMENT_BUCKET).remove([uploadedPath])
          if (cleanupError) console.error('Failed to remove an unattached document PDF:', cleanupError.message)
        } catch (cleanupError) {
          console.error('Failed to remove an unattached document PDF:', cleanupError)
        }
      }
      toast(error.message || 'The PDF could not be uploaded.', 'error')
    } finally {
      setUploadingDocument(false)
    }
  }

  const days = (d) => Math.floor((Date.now() - new Date(d)) / 86400000)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Request Management</h1><p className="text-gray-500 text-sm mt-1">Review and manage student requests</p></div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..." className="input search-input" />
          </div>
          <div className="flex gap-2">
            {['Documents', 'Leave & Gate Pass'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'Documents' && (
        <div className="card overflow-x-auto">
          {allDocs.length === 0 ? <EmptyState message="No active document requests." /> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">{['Request ID', 'Student', 'Type', 'Reason', 'Age', 'Status', 'Actions'].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {allDocs.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs text-blue-600 font-semibold">{r.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{r.student_name}</td>
                    <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{r.type}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs max-w-[150px] truncate">{r.reason}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{days(r.created_at)}d ago</td>
                    <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDoc(r)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">View</button>
                        {!['Approved', 'Rejected'].includes(r.status) && <>
                          <button onClick={() => applyDecision(r, 'doc', 'Approved')} disabled={updating} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100 disabled:opacity-50">Approve</button>
                          <button onClick={() => applyDecision(r, 'doc', 'Rejected')} disabled={updating} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100 disabled:opacity-50">Reject</button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'Documents' && approvedDocs.length > 0 && (
        <section className="card space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700"><FileUp size={19} /></span>
            <div>
              <h2 className="font-semibold text-gray-900">Approved documents — upload PDF</h2>
              <p className="text-sm text-gray-500">Attach the approved PDF to make it available in the student portal.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">{['Request ID', 'Student', 'Document', 'Approved', 'Action'].map(heading => <th key={heading} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{heading}</th>)}</tr></thead>
              <tbody>
                {approvedDocs.map(request => (
                  <tr key={request.id} className="border-b border-gray-50 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-blue-600">{request.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{request.student_name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{request.type}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{new Date(request.updated_at || request.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => openDoc(request)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                        <FileUp size={14} /> Upload PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'Leave & Gate Pass' && (
        <div className="card overflow-x-auto">
          {allLeave.length === 0 ? <EmptyState message="No active leave or gate pass requests." /> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">{['ID', 'Student', 'Type', 'Reason', 'Destination', 'Dates', 'Status', 'Actions'].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {allLeave.map(l => (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs text-blue-600 font-semibold">{l.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{l.student_name}</td>
                    <td className="py-3 px-4"><span className="badge bg-gray-100 text-gray-600 text-xs">{l.type}</span></td>
                    <td className="py-3 px-4 text-gray-500 text-xs max-w-[120px] truncate">{l.reason}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{l.destination}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">{l.from_date} → {l.to_date}</td>
                    <td className="py-3 px-4"><StatusBadge status={l.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openLeave(l)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">View</button>
                        {l.status === 'Pending' && <>
                          <button onClick={() => applyDecision(l, 'leave', 'Approved', 'Approved by admin')} disabled={updating} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100 disabled:opacity-50">Approve</button>
                          <button onClick={() => applyDecision(l, 'leave', 'Rejected', 'Rejected by admin')} disabled={updating} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100 disabled:opacity-50">Reject</button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Request ${detail?.id}`} size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {detailType === 'doc'
                ? [['Student', detail.student_name], ['Type', detail.type], ['Reason', detail.reason], ['Status', <StatusBadge key="s" status={detail.status} />], ['Submitted', new Date(detail.created_at).toLocaleDateString('en-IN')], ['Last Updated', new Date(detail.updated_at).toLocaleDateString('en-IN')]].map(([l, v]) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="text-sm font-medium text-gray-800">{v}</p></div>
                  ))
                : [['Student', detail.student_name], ['Type', detail.type], ['Reason', detail.reason], ['Destination', detail.destination], ['From', `${detail.from_date} ${detail.from_time}`], ['To', `${detail.to_date} ${detail.to_time}`]].map(([l, v]) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="text-sm font-medium text-gray-800">{v}</p></div>
                  ))
              }
            </div>
            {!['Approved', 'Rejected'].includes(detail.status) && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Comment (optional)</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Add a comment for the student..." className="input resize-none text-sm" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleAction('Rejected')} disabled={updating} className="btn-danger flex-1 justify-center">Reject</button>
                  <button onClick={() => handleAction('Approved')} disabled={updating} className="btn-success flex-1 justify-center">
                    {updating ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : 'Approve'}
                  </button>
                </div>
              </div>
            )}
            {detailType === 'doc' && detail.status?.toLowerCase() === 'approved' && !detail.file_url && (
              <section className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex items-start gap-3">
                  <FileCheck2 size={19} className="mt-0.5 shrink-0 text-emerald-700" />
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-900">Provide the approved document</h3>
                    <p className="mt-1 text-xs leading-5 text-emerald-800">Import the final PDF. The student will be able to download it from their Documents page.</p>
                  </div>
                </div>
                <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">
                  {uploadingDocument ? <><Loader2 size={16} className="animate-spin" /> Uploading PDF...</> : <><FileUp size={16} /> Choose PDF (max 10 MB)</>}
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={uploadApprovedDocument}
                    disabled={uploadingDocument}
                    className="sr-only"
                  />
                </label>
              </section>
            )}
            {detail.admin_comment && <div className="bg-blue-50 rounded-xl p-3"><p className="text-xs text-blue-600 font-medium mb-1">Admin Comment</p><p className="text-sm text-gray-800">{detail.admin_comment}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  )
}
