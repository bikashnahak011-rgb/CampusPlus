import { useState } from 'react'
import { Star, Edit2, Loader2, Save } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export default function AdminMess() {
  const { messFeedback, messMenu, updateMessMenu } = useApp()
  const toast = useToast()
  const [tab, setTab] = useState('Menu')
  const [activeDay, setActiveDay] = useState('Monday')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({ breakfast: '', lunch: '', snacks: '', dinner: '' })

  const menu = messMenu[activeDay]
  const avgRating = messFeedback.length > 0 ? (messFeedback.reduce((a,f) => a + f.rating, 0) / messFeedback.length).toFixed(1) : 'N/A'

  const saveMenu = async () => {
    setSaving(true)
    try {
      await updateMessMenu(activeDay, draft)
      setEditing(false)
      toast(`${activeDay} menu saved.`, 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Mess Management</h1><p className="text-gray-500 text-sm mt-1">Menu and student feedback</p></div>

      <div className="flex gap-2">
        {['Menu','Feedback'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab===t?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
        ))}
      </div>

      {tab === 'Menu' && (
        <div className="card">
          <div className="flex gap-2 flex-wrap mb-6">
            {DAYS.map(d => (
              <button key={d} disabled={editing} onClick={() => setActiveDay(d)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 ${activeDay===d?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{d.slice(0,3)}</button>
            ))}
          </div>
          <div className="mb-4 flex justify-end">
            {editing ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                <button type="button" onClick={saveMenu} disabled={saving} className="btn-primary sm:!w-auto">{saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save menu</>}</button>
              </div>
            ) : (
              <button type="button" onClick={() => { setDraft({ breakfast: menu?.breakfast || '', lunch: menu?.lunch || '', snacks: menu?.snacks || '', dinner: menu?.dinner || '' }); setEditing(true) }} className="btn-secondary"><Edit2 size={15} /> Edit menu</button>
            )}
          </div>
          {!menu && !editing ? <p className="py-8 text-center text-sm text-gray-500">No menu published for {activeDay} yet.</p> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[['🌅','Breakfast','breakfast','7:30-9:00 AM'],['☀️','Lunch','lunch','12:30-2:00 PM'],['🍵','Snacks','snacks','4:30-5:30 PM'],['🌙','Dinner','dinner','7:30-9:00 PM']].map(([emoji,label,key,time]) => (
                <div key={key} className="min-w-0 rounded-xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2"><span className="text-xl">{emoji}</span><div><p className="text-sm font-semibold text-gray-900">{label}</p><p className="text-xs text-gray-400">{time}</p></div></div>
                  {editing
                    ? <textarea value={draft[key]} onChange={event => setDraft(previous => ({ ...previous, [key]: event.target.value }))} rows={3} aria-label={`${label} menu`} className="w-full resize-y rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-700" />
                    : <p className="text-sm text-gray-700">{menu?.[key]}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Feedback' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="card text-center"><p className="text-3xl font-bold text-yellow-500 mb-1">{avgRating}</p><p className="text-gray-500 text-sm">Average Rating</p></div>
            <div className="card text-center"><p className="text-3xl font-bold text-blue-600 mb-1">{messFeedback.length}</p><p className="text-gray-500 text-sm">Total Feedback</p></div>
            <div className="card text-center"><p className="text-3xl font-bold text-green-600 mb-1">{messFeedback.filter(f=>f.rating>=4).length}</p><p className="text-gray-500 text-sm">Positive Reviews</p></div>
          </div>
          {messFeedback.length === 0
            ? <div className="card text-center py-10"><p className="text-gray-400">No feedback submitted yet.</p></div>
            : (
              <div className="card space-y-3">
                <h2 className="font-semibold text-gray-900">Recent Feedback</h2>
                {messFeedback.map(f => (
                  <div key={f.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{f.day} • {new Date(f.created_at).toLocaleDateString('en-IN')}</span>
                      <div className="flex">{[1,2,3,4,5].map(n=><Star key={n} size={14} className={n<=f.rating?'text-yellow-400 fill-yellow-400':'text-gray-300'} />)}</div>
                    </div>
                    {f.comment && <p className="text-sm text-gray-700">{f.comment}</p>}
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  )
}
