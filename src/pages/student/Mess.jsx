import { useState } from 'react'
import { Star, Send, Loader2, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import MessMenuWeek from '../../components/MessMenuWeek'
import { MESS_DAYS } from '../../data/messMenuConfig'

export default function MessPage() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const [activeDay, setActiveDay] = useState(MESS_DAYS.includes(today) ? today : 'Monday')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const { messMenu, addMessFeedback } = useApp()
  const toast = useToast()

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

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Mess Menu</h1><p className="text-gray-500 text-sm mt-1">Weekly meal schedule and feedback</p></div>

      <MessMenuWeek menus={messMenu} activeDay={activeDay} onSelectDay={setActiveDay} />

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
