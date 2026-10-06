import { useState } from 'react'
import { Star, Edit2, Loader2, Save } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import MessMenuWeek from '../../components/MessMenuWeek'
import { MEAL_SLOTS, MESS_DAYS } from '../../data/messMenuConfig'

export default function AdminMess({ view = 'overview' }) {
  const { messFeedback, messMenu, updateMessMenu } = useApp()
  const toast = useToast()
  const [activeDay, setActiveDay] = useState(() => new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()))
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({ breakfast: '', lunch: '', snacks: '', dinner: '' })

  const menu = messMenu[activeDay]
  const avgRating = messFeedback.length > 0 ? (messFeedback.reduce((a,f) => a + f.rating, 0) / messFeedback.length).toFixed(1) : 'N/A'
  const pageTitle = view === 'feedback' ? 'Meal Feedback' : view === 'menu' ? "Today's Menu" : 'Mess Management'

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
      <div><h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1><p className="text-gray-500 text-sm mt-1">{view === 'feedback' ? 'Review student ratings and comments on meals.' : view === 'menu' ? 'Review and update the weekly meal schedule.' : 'Today’s menu and recent student feedback.'}</p></div>

      {view === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="card">
            <h2 className="font-semibold text-gray-900">Today · {activeDay}</h2>
            {menu ? <div className="mt-3 space-y-2 text-sm text-gray-600">
              {MEAL_SLOTS.map(meal => <p key={meal.key}><span className="font-medium text-gray-800">{meal.label}:</span> {menu[meal.key] || 'Not listed'}</p>)}
            </div> : <p className="mt-3 text-sm text-gray-500">No menu has been published for today.</p>}
          </section>
          <section className="card">
            <h2 className="font-semibold text-gray-900">Student feedback</h2>
            <div className="mt-3 flex items-end gap-3">
              <p className="text-3xl font-bold text-yellow-500">{avgRating}</p>
              <p className="pb-1 text-sm text-gray-500">{messFeedback.length} reviews</p>
            </div>
            <p className="mt-2 text-sm text-gray-500">{messFeedback.filter(item => item.rating >= 4).length} positive reviews</p>
          </section>
        </div>
      )}

      {view === 'menu' && (
        <div className="space-y-4">
          <MessMenuWeek menus={messMenu} activeDay={activeDay} onSelectDay={day => { if (!editing && MESS_DAYS.includes(day)) setActiveDay(day) }} />
          <section className="admin-mess-editor-panel">
            <div className="admin-mess-editor-heading">
              <div><p>Selected day</p><h2>{activeDay}</h2></div>
            {editing ? (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                <button type="button" onClick={saveMenu} disabled={saving} className="btn-primary sm:!w-auto">{saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save menu</>}</button>
              </div>
            ) : (
              <button type="button" onClick={() => { setDraft({ breakfast: menu?.breakfast || '', lunch: menu?.lunch || '', snacks: menu?.snacks || '', dinner: menu?.dinner || '' }); setEditing(true) }} className="btn-secondary"><Edit2 size={15} /> Edit menu</button>
            )}
            </div>
            {editing ? (
              <div className="admin-mess-editor-meals">
                {MEAL_SLOTS.map(meal => (
                  <label key={meal.key} className={`admin-mess-editor-meal admin-mess-editor-meal--${meal.color}`}>
                    <span className="admin-mess-editor-meal-title"><span aria-hidden="true">{meal.emoji}</span>{meal.label}<small>{meal.time}</small></span>
                    <textarea value={draft[meal.key]} onChange={event => setDraft(previous => ({ ...previous, [meal.key]: event.target.value }))} rows={3} aria-label={`${meal.label} menu`} className="w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700" />
                  </label>
                ))}
              </div>
            ) : (
              <p className="admin-mess-editor-hint">Select a day from the weekly menu above, then choose “Edit menu” to update its meals.</p>
            )}
          </section>
        </div>
      )}

      {view === 'feedback' && (
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
