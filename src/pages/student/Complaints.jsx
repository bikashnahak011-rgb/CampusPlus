import { useState } from 'react'
import { Plus, Search, Brain, Loader2, MapPin, Clock, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { StatusBadge, EmptyState } from '../../components/ui/States'
import { analyzeComplaint } from '../../lib/aiService'

const CATEGORIES = ['Hostel', 'Mess', 'Electricity', 'Water', 'Cleaning', 'Academic', 'Transport', 'Other']
const FILTERS = ['All', 'High Priority', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed']

export default function ComplaintsPage() {
  const { user } = useAuth()
  const { complaints, submitComplaint } = useApp()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [detail, setDetail] = useState(null)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ category: '', location: '', description: '', priority: 'Medium' })

  const myComplaints = complaints.filter(c => c.student_id === user?.id)
  const filtered = myComplaints.filter(c => {
    const mf = filter === 'All' ? true : filter === 'High Priority' ? c.priority === 'High' : c.status === filter
    const ms = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  const handleAI = async () => {
    if (!form.description.trim()) { toast('Enter a description first.', 'warning'); return }
    setAiLoading(true)
    const r = await analyzeComplaint(form.description)
    setAiResult(r)
    setForm(f => ({ ...f, category: r.category.split('/')[0].trim(), priority: r.priority, location: r.location !== 'Campus' ? r.location : f.location }))
    setAiLoading(false)
    toast('AI analysis complete!', 'success')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category || !form.description || !form.location) { toast('Please fill all required fields.', 'warning'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 700))
    const id = submitComplaint({ ...form, ai_category: aiResult?.category, department: aiResult?.department || 'Administration' }, user.id, user.name)
    setSubmitting(false)
    setShowForm(false)
    setForm({ category: '', location: '', description: '', priority: 'Medium' })
    setAiResult(null)
    toast(`✓ Complaint ${id} submitted successfully.`, 'success')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">My Complaints</h1><p className="text-gray-500 text-sm mt-1">Track and manage your campus complaints</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={18} /> Report a Problem</button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints..." className="input pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? <div className="card"><EmptyState message="No complaints found." /></div> : filtered.map(c => (
          <button key={c.id} onClick={() => setDetail(c)} className="card w-full text-left hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs text-blue-600 font-semibold">{c.id}</span>
                  <span className={`badge text-xs ${c.priority === 'High' ? 'bg-red-100 text-red-700' : c.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{c.priority}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="font-medium text-gray-900">{c.category}</p>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={12} />{c.location}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                  {c.department && <span>→ {c.department}</span>}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setAiResult(null) }} title="Report a Problem" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe your problem in detail..." className="input resize-none" />
            <button type="button" onClick={handleAI} disabled={aiLoading || !form.description.trim()} className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50">
              {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
              {aiLoading ? 'Analyzing...' : '✨ Auto-detect with AI'}
            </button>
          </div>

          {aiResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1"><Brain size={13} /> AI Analysis ({aiResult.source === 'openai' ? 'OpenAI' : 'Smart Detection'})</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[['Category', aiResult.category, 'bg-white'], ['Priority', aiResult.priority, 'bg-white'], ['Department', aiResult.department, 'bg-white'], ['Action', aiResult.suggestedAction, 'bg-white']].map(([l, v, bg]) => (
                  <div key={l} className={`${bg} rounded-xl p-2`}><p className="text-gray-400">{l}</p><p className="font-semibold text-gray-800">{v}</p></div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input">
                {['Low', 'Medium', 'High'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Room / Location *</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Hostel Block A, Room 203" className="input" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setAiResult(null) }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Complaint ${detail?.id}`} size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[['Category', detail.category], ['Priority', detail.priority], ['Status', <StatusBadge key="s" status={detail.status} />], ['Department', detail.department || 'Unassigned'], ['Location', detail.location], ['Assigned To', detail.assigned_to || 'Not assigned']].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="text-sm font-medium text-gray-800">{v}</p></div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Description</p><p className="text-sm text-gray-800">{detail.description}</p></div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Status Timeline</p>
              <div className="space-y-3">
                {detail.updates?.map((u, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-0.5" />
                      {i < detail.updates.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm font-medium text-gray-900">{u.status}</p>
                      <p className="text-xs text-gray-500">{u.note}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(u.time).toLocaleString('en-IN')}</p>
                    </div>
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
