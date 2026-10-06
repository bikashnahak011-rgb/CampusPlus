import { useEffect, useState } from 'react'
import { Star, Edit2, Loader2, Save, ShoppingBag, RefreshCw } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { supabase } from '../../lib/supabase'
import { getDemoMessOrders, saveDemoMessOrders } from '../../lib/messOrderStorage'
import MessMenuWeek from '../../components/MessMenuWeek'
import { MEAL_SLOTS, MESS_DAYS } from '../../data/messMenuConfig'

const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'served', 'cancelled']

function formatServiceDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function AdminMess({ view = 'overview' }) {
  const { messFeedback, messMenu, updateMessMenu } = useApp()
  const { user } = useAuth()
  const toast = useToast()
  const [activeDay, setActiveDay] = useState(() => new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()))
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({ breakfast: '', lunch: '', snacks: '', dinner: '' })
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(view === 'overview')
  const [orderError, setOrderError] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState('')
  const [reloadOrders, setReloadOrders] = useState(0)

  const menu = messMenu[activeDay]
  const avgRating = messFeedback.length > 0 ? (messFeedback.reduce((a,f) => a + f.rating, 0) / messFeedback.length).toFixed(1) : 'N/A'
  const pageTitle = view === 'feedback' ? 'Meal Feedback' : view === 'menu' ? "Today's Menu" : 'Mess Management'

  useEffect(() => {
    if (view !== 'overview') return undefined
    let active = true
    const loadOrders = async () => {
      if (user?.isDemo) {
        const demoOrders = getDemoMessOrders().sort((a, b) => `${a.service_date}${a.created_at}`.localeCompare(`${b.service_date}${b.created_at}`))
        if (active) { setOrders(demoOrders); setOrdersLoading(false); setOrderError('') }
        return
      }
      if (!supabase) {
        if (active) { setOrdersLoading(false); setOrderError('Supabase is not configured.') }
        return
      }
      const { data, error } = await supabase.from('mess_orders').select('*').order('service_date', { ascending: true }).order('created_at', { ascending: true })
      if (!active) return
      if (error) setOrderError(`${error.message}. Apply supabase/mess_orders.sql to enable food orders.`)
      else { setOrders(data || []); setOrderError('') }
      setOrdersLoading(false)
    }
    loadOrders()
    if (user?.isDemo || !supabase) return () => { active = false }
    const channel = supabase.channel('mess-orders-admin-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mess_orders' }, loadOrders)
      .subscribe()
    return () => { active = false; supabase.removeChannel(channel) }
  }, [view, user?.isDemo, reloadOrders])

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

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId)
    try {
      if (user?.isDemo) {
        const allOrders = getDemoMessOrders().map(order => order.id === orderId ? { ...order, status, updated_at: new Date().toISOString() } : order)
        saveDemoMessOrders(allOrders)
        setOrders(allOrders.sort((a, b) => `${a.service_date}${a.created_at}`.localeCompare(`${b.service_date}${b.created_at}`)))
      } else {
        const { data, error } = await supabase.from('mess_orders').update({ status }).eq('id', orderId).select().single()
        if (error) throw error
        setOrders(current => current.map(order => order.id === orderId ? data : order))
      }
      toast('Meal order status updated.', 'success')
    } catch (error) {
      toast(`Order status could not be updated: ${error.message}`, 'error')
    } finally {
      setUpdatingOrderId('')
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1><p className="text-gray-500 text-sm mt-1">{view === 'feedback' ? 'Review student ratings and comments on meals.' : view === 'menu' ? 'Review and update the weekly meal schedule.' : 'Today’s menu and recent student feedback.'}</p></div>

      {view === 'overview' && (
        <div className="space-y-5">
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
        <section className="space-y-4" aria-labelledby="mess-orders-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 id="mess-orders-heading" className="flex items-center gap-2 text-lg font-bold text-gray-900"><ShoppingBag size={19} /> Meal orders</h2><p className="mt-1 text-sm text-gray-500">Student reservations appear here as they are placed.</p></div>
            <button type="button" className="btn-secondary" disabled={ordersLoading} onClick={() => setReloadOrders(value => value + 1)}><RefreshCw size={15} /> Refresh</button>
          </div>
          {orderError && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{orderError}</p>}
          {ordersLoading ? <div className="card text-sm text-gray-500">Loading meal orders...</div> : orders.length === 0 ? (
            <div className="card text-sm text-gray-500">No meal orders have been placed yet.</div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {orders.map(order => {
                const meal = MEAL_SLOTS.find(item => item.key === order.meal_slot)
                return <article key={order.id} className="card space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">{meal?.emoji} {meal?.label || order.meal_slot} · {formatServiceDate(order.service_date)}</p><h3 className="mt-1 font-bold text-gray-900">{order.student_name || 'Student'}{order.student_roll_no ? ` · ${order.student_roll_no}` : ''}</h3></div>
                    <span className={`mess-order-status mess-order-status--${order.status}`}>{order.status}</span>
                  </div>
                  <p className="text-sm text-gray-700">{order.meal_description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-200 pt-3">
                    <span className="text-xs text-gray-600">Quantity: {order.quantity}{order.notes ? ` · ${order.notes}` : ''}</span>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">Update status
                      <select aria-label={`Order status for ${order.student_name || 'student'}`} disabled={updatingOrderId === order.id} value={order.status} onChange={event => updateOrderStatus(order.id, event.target.value)} className="rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-xs text-gray-800">
                        {ORDER_STATUSES.map(status => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                      </select>
                    </label>
                  </div>
                </article>
              })}
            </div>
          )}
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
