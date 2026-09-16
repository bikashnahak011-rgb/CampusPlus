import { useState } from 'react'
import { Search, Loader2, ChevronRight } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { StatusBadge, EmptyState } from '../../components/ui/States'

export default function AdminRequests() {
  const { requests, leaveRequests, updateRequest, updateLeave } = useApp()
  const toast = useToast()
  const [tab, setTab] = useState('Documents')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailType, setDetailType] = useState('doc')
  const [comment, setComment] = useState('')
  const [updating, setUpdating] = useState(false)

  const allDocs = requests.filter(r => !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.student_name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()))
  const allLeave = leaveRequests.filter(l => !search || l.id.toLowerCase().includes(search.toLowerCase()) || l.student_name.toLowerCase().includes(search.toLowerCase()))

  const openDoc = (r) => { setDetail(r); setDetailType('doc'); setComment(r.admin_comment || '') }
  const openLeave = (l) => { setDetail(l); setDetailType('leave'); setComment(l.admin_comment || '') }

  const handleAction = async (action) => {
    setUpdating(true)
    await new Promise(r => setTimeout(r, 600))
    if (detailType === 'doc') {
      updateRequest(detail.id, action, comment)
    } else {
      updateLeave(detail.id, action, comment)
    }
    setUpdating(false)
    setDetail(null)
    toast(`✓ ${detail.id} ${action.toLowerCase()}.`, action === 'Approved' ? 'success' : 'info')
  }

  const days = (d) => Math.floor((Date.now() - new Date(d)) / 86400000)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Request Management</h1><p className="text-gray-500 text-sm mt-1">Review and manage student requests</p></div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..." className="input pl-9" />
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
          {allDocs.length === 0 ? <EmptyState message="No document requests." /> : (
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
                          <button onClick={() => { setDetail(r); setDetailType('doc'); setComment(''); setTimeout(() => handleAction('Approved'), 0) }} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100">Approve</button>
                          <button onClick={() => { setDetail(r); setDetailType('doc'); setComment(''); setTimeout(() => handleAction('Rejected'), 0) }} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100">Reject</button>
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

      {tab === 'Leave & Gate Pass' && (
        <div className="card overflow-x-auto">
          {allLeave.length === 0 ? <EmptyState message="No leave requests." /> : (
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
                          <button onClick={async () => { setDetail(l); setDetailType('leave'); await new Promise(r => setTimeout(r, 0)); updateLeave(l.id, 'Approved', 'Approved by admin'); toast(`✓ ${l.id} approved.`, 'success') }} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100">Approve</button>
                          <button onClick={async () => { updateLeave(l.id, 'Rejected', 'Rejected by admin'); toast(`${l.id} rejected.`, 'info') }} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100">Reject</button>
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
            {detail.admin_comment && <div className="bg-blue-50 rounded-xl p-3"><p className="text-xs text-blue-600 font-medium mb-1">Admin Comment</p><p className="text-sm text-gray-800">{detail.admin_comment}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  )
}
