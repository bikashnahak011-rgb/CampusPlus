import { useState } from 'react'
import { Plus, Megaphone, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'

const TARGETS = ['All Students','Computer Science','Mechanical Engg','Electronics','Year 1','Year 2','Year 3','Hostel','Day Scholars']

export default function AdminNotices() {
  const { user } = useAuth()
  const { notices, addNotice } = useApp()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title:'', content:'', target:'All Students', important:false })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) { toast('Please fill all fields.','warning'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    addNotice(form, user?.name)
    setSubmitting(false)
    setShowForm(false)
    setForm({ title:'', content:'', target:'All Students', important:false })
    toast('✓ Notice published successfully.','success')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Notices</h1><p className="text-gray-500 text-sm mt-1">Publish and manage campus notices</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={18} /> Publish Notice</button>
      </div>

      <div className="space-y-3">
        {notices.length === 0
          ? <div className="card text-center py-10"><Megaphone size={32} className="text-gray-300 mx-auto mb-2" /><p className="text-gray-400">No notices yet.</p></div>
          : notices.map(n => (
            <div key={n.id} className={`card ${n.important ? 'border-l-4 border-l-orange-400' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {n.important && <span className="badge bg-orange-100 text-orange-700 text-xs">Important</span>}
                    <span className="badge bg-blue-100 text-blue-700 text-xs">{n.target}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{n.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{n.content}</p>
                  <p className="text-xs text-gray-400 mt-2">By {n.created_by} • {new Date(n.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <Megaphone size={20} className="text-gray-300 flex-shrink-0" />
              </div>
            </div>
          ))}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Publish New Notice">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Notice title" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea value={form.content} onChange={e => setForm(f=>({...f,content:e.target.value}))} rows={4} placeholder="Notice content..." className="input resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
            <select value={form.target} onChange={e => setForm(f=>({...f,target:e.target.value}))} className="input">
              {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="imp" checked={form.important} onChange={e => setForm(f=>({...f,important:e.target.checked}))} className="w-4 h-4 rounded" />
            <label htmlFor="imp" className="text-sm text-gray-700">Mark as Important</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Publishing...</> : <><Megaphone size={16} /> Publish Notice</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
