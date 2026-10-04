import { useState } from 'react'
import { Plus, Megaphone, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'

const TARGETS = ['All Students','Computer Science','Mechanical Engg','Electronics','Year 1','Year 2','Year 3','Hostel','Day Scholars']
const PRIORITIES = [
  { value: 'critical', label: 'Critical' },
  { value: 'important', label: 'Important' },
  { value: 'normal', label: 'Normal' },
]
const priorityStyles = {
  critical: 'bg-red-100 text-red-700',
  important: 'bg-orange-100 text-orange-700',
  normal: 'bg-gray-100 text-gray-600',
}

export default function AdminNotices() {
  const { user } = useAuth()
  const { notices, addNotice } = useApp()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title:'', content:'', target:'All Students', priority:'normal' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) { toast('Please fill all fields.','warning'); return }
    setSubmitting(true)
    try {
      const publishedNotice = await addNotice(form, user?.name)
      setShowForm(false)
      setForm({ title:'', content:'', target:'All Students', priority:'normal' })
      if (user?.isDemo) {
        toast('Demo notice published. Live push requires a connected backend.', 'success')
        return
      }
      const delivery = publishedNotice.delivery
      if (publishedNotice.deliveryError || delivery?.in_app_failed > 0 || !delivery?.push_configured || delivery?.push_eligible === 0) {
        const unavailable = publishedNotice.deliveryError || [
          delivery?.in_app_failed > 0 && 'in-app bell alerts could not be created',
          delivery?.notified === 0 && 'there are no students in this notice audience',
          !delivery?.push_configured && 'push service is not configured',
          delivery?.push_configured && delivery?.push_eligible === 0 && 'no students have enabled browser push',
        ].filter(Boolean).join('; ')
        toast(`Notice published, but ${unavailable}.`, 'warning')
      } else {
        toast(`Notice published. Browser push alerts sent: ${delivery.push_sent}.`, 'success')
      }
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSubmitting(false)
    }
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
            <div key={n.id} className={`card ${n.priority === 'critical' ? 'border-l-4 border-l-red-500' : n.priority === 'important' || n.important ? 'border-l-4 border-l-orange-400' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge text-xs capitalize ${priorityStyles[n.priority || (n.important ? 'important' : 'normal')]}`}>
                      {n.priority || (n.important ? 'Important' : 'Normal')}
                    </span>
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
          <div>
            <label htmlFor="notice-priority" className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
            <select id="notice-priority" value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))} className="input">
              {PRIORITIES.map(priority => <option key={priority.value} value={priority.value}>{priority.label}</option>)}
            </select>
            <p className="mt-1.5 text-xs text-gray-500">All notices appear in the student bell and send browser push alerts to students who enabled them. No SMS service is used.</p>
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
