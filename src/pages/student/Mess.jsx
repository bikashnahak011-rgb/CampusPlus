import { useEffect, useMemo, useState } from 'react'
import { Star, Send, Loader2, Check, Clock3, ShoppingBag } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import { supabase } from '../../lib/supabase'
import { getDemoMessOrders, makeLocalDateValue, saveDemoMessOrders } from '../../lib/messOrderStorage'
import MessMenuWeek from '../../components/MessMenuWeek'
import { MEAL_SLOTS, MESS_DAYS } from '../../data/messMenuConfig'
import { DEMO_MESS_MENU } from '../../data/demoData'
import SamplePreviewNotice from '../../components/ui/SamplePreviewNotice'

function getWeekLimit() {
  const date = new Date()
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7))
  return makeLocalDateValue(date)
}

function formatOrderDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function MessPage() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const [activeDay, setActiveDay] = useState(MESS_DAYS.includes(today) ? today : 'Monday')
  const [serviceDate, setServiceDate] = useState(() => makeLocalDateValue())
  const [mealSlot, setMealSlot] = useState('breakfast')
  const [quantity, setQuantity] = useState(1)
  const [orderNotes, setOrderNotes] = useState('')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const { messMenu, addMessFeedback } = useApp()
  const toast = useToast()
  const orderDay = useMemo(() => new Date(`${serviceDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }), [serviceDate])
  const hasLiveMenu = Object.keys(messMenu || {}).length > 0
  const sampleMenuPreview = !user?.isDemo && !hasLiveMenu
  const displayMenu = hasLiveMenu ? messMenu : DEMO_MESS_MENU
  const selectedMenu = displayMenu?.[orderDay]
  const availableMeals = MEAL_SLOTS.filter(meal => selectedMenu?.[meal.key]?.trim())
  const selectedMeal = availableMeals.find(meal => meal.key === mealSlot) || availableMeals[0]

  useEffect(() => {
    if (!user?.id) { setOrders([]); setOrdersLoading(false); return undefined }
    let active = true

    const loadOrders = async () => {
      setOrdersLoading(true)
      if (user.isDemo) {
        if (active) {
          setOrders(getDemoMessOrders().filter(order => order.student_id === user.id))
          setOrdersError('')
        }
        setOrdersLoading(false)
        return
      }
      if (!supabase) {
        setOrdersLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('mess_orders')
        .select('*')
        .eq('student_id', user.id)
        .order('service_date', { ascending: true })
        .order('created_at', { ascending: false })
      if (!active) return
      if (error) setOrdersError(`Meal orders could not load: ${error.message}. Apply supabase/mess_orders.sql first.`)
      else { setOrders(data || []); setOrdersError('') }
      setOrdersLoading(false)
    }

    loadOrders()
    return () => { active = false }
  }, [user?.id, user?.isDemo])

  const handleFeedback = async (e) => {
    e.preventDefault()
    if (!rating) { toast('Please select a rating.', 'warning'); return }
    setSubmitting(true)
    try {
      await addMessFeedback({ day: activeDay, rating, comment: feedbackText }, user?.id)
      setRating(0)
      setFeedbackText('')
      toast('Feedback submitted. Thank you!', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePlaceOrder = async (event) => {
    event.preventDefault()
    if (!selectedMeal || !user?.id || sampleMenuPreview) return
    const order = {
      student_id: user.id,
      student_name: user.name || user.email || 'Student',
      student_roll_no: user.roll_no || null,
      service_date: serviceDate,
      meal_slot: selectedMeal.key,
      meal_description: selectedMenu[selectedMeal.key].trim(),
      quantity: Number(quantity),
      notes: orderNotes.trim() || null,
      status: 'pending',
    }

    setPlacingOrder(true)
    try {
      let savedOrder
      if (user.isDemo) {
        savedOrder = { ...order, id: crypto.randomUUID(), created_at: new Date().toISOString() }
        const allOrders = [savedOrder, ...getDemoMessOrders()]
        saveDemoMessOrders(allOrders)
      } else {
        if (!supabase) throw new Error('Meal ordering requires the campus Supabase connection.')
        const { data, error } = await supabase.from('mess_orders').insert(order).select().single()
        if (error) throw new Error(`${error.message}. Apply supabase/mess_orders.sql to enable ordering.`)
        savedOrder = data
      }
      setOrders(current => [savedOrder, ...current])
      setQuantity(1)
      setOrderNotes('')
      toast('Meal order saved. You can track it in Your meal orders.', 'success')
    } catch (error) {
      toast(error.message || 'Your meal order could not be saved.', 'error')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Mess Menu</h1><p className="text-gray-500 text-sm mt-1">Weekly meal schedule and feedback</p></div>

      {sampleMenuPreview && <SamplePreviewNotice>Meals below are examples only. Ordering is disabled until the mess publishes a live menu.</SamplePreviewNotice>}

      <MessMenuWeek menus={displayMenu} activeDay={activeDay} onSelectDay={setActiveDay} />

      <section className="card space-y-5" aria-labelledby="meal-order-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-violet-700"><ShoppingBag size={15} /> Meal reservation</p>
            <h2 id="meal-order-heading" className="text-lg font-bold text-gray-900">Order from the mess menu</h2>
            <p className="mt-1 text-sm text-gray-600">Choose a published meal and save your reservation. No online payment is collected.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-800"><Clock3 size={14} /> Orders go to Mess Management</span>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Meal date
            <input type="date" min={makeLocalDateValue()} max={getWeekLimit()} value={serviceDate} onChange={event => setServiceDate(event.target.value)} className="input mt-1" required />
          </label>
          <label className="text-sm font-medium text-gray-700">Available meal
            <select value={selectedMeal?.key || ''} onChange={event => setMealSlot(event.target.value)} className="input mt-1" disabled={!availableMeals.length || sampleMenuPreview} required>
              {availableMeals.length ? availableMeals.map(meal => <option key={meal.key} value={meal.key}>{meal.label} · {meal.time}</option>) : <option value="">No published meals for {orderDay}</option>}
            </select>
          </label>
          {selectedMeal && <div className="md:col-span-2 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">{selectedMeal.emoji} {selectedMeal.label}</p>
            <p className="mt-1 font-semibold text-gray-900">{selectedMenu[selectedMeal.key]}</p>
            <p className="mt-1 text-xs text-gray-500">Serving time: {selectedMeal.time}</p>
          </div>}
          <label className="text-sm font-medium text-gray-700">Quantity
            <input type="number" min="1" max="10" step="1" value={quantity} onChange={event => setQuantity(event.target.value)} className="input mt-1" required />
          </label>
          <label className="text-sm font-medium text-gray-700">Note for the mess (optional)
            <input type="text" maxLength="160" value={orderNotes} onChange={event => setOrderNotes(event.target.value)} placeholder="Dietary or pickup note" className="input mt-1" />
          </label>
          <div className="md:col-span-2">
            <button type="submit" disabled={sampleMenuPreview || placingOrder || !selectedMeal || !serviceDate || !Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 10} className="btn-primary sm:w-auto sm:px-6">
              {placingOrder ? <><Loader2 size={16} className="animate-spin" /> Saving order...</> : <><ShoppingBag size={16} /> Place meal order</>}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4" aria-labelledby="my-mess-orders-heading">
        <div className="flex items-center justify-between gap-3">
          <div><h2 id="my-mess-orders-heading" className="text-lg font-bold text-gray-900">Your meal orders</h2><p className="text-sm text-gray-500">Saved reservations and their current status.</p></div>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">{orders.length} orders</span>
        </div>
        {ordersError && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{ordersError}</p>}
        {ordersLoading ? <div className="card text-sm text-gray-500">Loading your meal orders...</div> : orders.length === 0 ? (
          <div className="card text-sm text-gray-500">No meal orders yet. Select a published meal above to reserve it.</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {orders.map(order => {
              const orderMeal = MEAL_SLOTS.find(meal => meal.key === order.meal_slot)
              return <article className="card space-y-3" key={order.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">{orderMeal?.emoji} {orderMeal?.label || order.meal_slot}</p><h3 className="mt-1 font-bold text-gray-900">{formatOrderDate(order.service_date)}</h3></div>
                  <span className={`mess-order-status mess-order-status--${order.status}`}>{order.status}</span>
                </div>
                <p className="text-sm text-gray-700">{order.meal_description}</p>
                <div className="flex flex-wrap justify-between gap-2 border-t border-violet-200 pt-3 text-xs text-gray-600"><span>Quantity: {order.quantity}</span><span>Ordered {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
                {order.notes && <p className="text-xs text-gray-500">Note: {order.notes}</p>}
              </article>
            })}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="font-semibold text-gray-900 mb-1">Canteen Rules</h2>
        <p className="text-xs text-gray-500 mb-4">Help keep the dining area clean and comfortable.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            'Wait your turn and follow the queue.',
            'Keep tables and serving areas clean.',
            'Take only what you can finish.',
            'Put trays and waste in their designated areas.',
          ].map(rule => (
            <div key={rule} className="flex items-start gap-2 text-sm text-gray-600">
              <Check size={16} className="mt-0.5 shrink-0 text-violet-600" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </section>

      {activeDay === today && (
        <div className="card animate-slide-up">
          <h2 className="font-semibold text-gray-900 mb-4">How was today's meal?</h2>
          <form onSubmit={handleFeedback} className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)} className="transition-transform hover:scale-110">
                  <Star size={32} className={`${n <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} transition-colors`} />
                </button>
              ))}
              {rating > 0 && <span className="text-sm text-gray-500 ml-2">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</span>}
            </div>
            <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={2} placeholder="Any comments about today's meal? (optional)" className="input resize-none" />
            <button type="submit" disabled={submitting || !rating} className="btn-primary sm:w-auto sm:px-6">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Feedback</>}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
