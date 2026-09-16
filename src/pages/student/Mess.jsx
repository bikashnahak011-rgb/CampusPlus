import { useState } from 'react'
import { Star, Send, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import { DEMO_MESS_MENU } from '../../data/demoData'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅', time: '7:30 AM - 9:00 AM' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️', time: '12:30 PM - 2:00 PM' },
  { key: 'snacks', label: 'Snacks', emoji: '🍵', time: '4:30 PM - 5:30 PM' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙', time: '7:30 PM - 9:00 PM' },
]

export default function MessPage() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const [activeDay, setActiveDay] = useState(DAYS.includes(today) ? today : 'Monday')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const { addMessFeedback } = useApp()
  const toast = useToast()

  const menu = DEMO_MESS_MENU[activeDay]

  const handleFeedback = async (e) => {
    e.preventDefault()
    if (!rating) { toast('Please select a rating.', 'warning'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    addMessFeedback({ day: activeDay, rating, comment: feedbackText }, user?.id)
    setRating(0); setFeedbackText('')
    setSubmitting(false)
    toast('✓ Feedback submitted. Thank you!', 'success')
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Mess Menu</h1><p className="text-gray-500 text-sm mt-1">Weekly meal schedule and feedback</p></div>

      <div className="card">
        <div className="flex gap-2 flex-wrap mb-6">
          {DAYS.map(d => (
            <button key={d} onClick={() => setActiveDay(d)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeDay === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {d.slice(0, 3)}{d === today && <span className="ml-1 text-xs opacity-75">(Today)</span>}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MEALS.map(({ key, label, emoji, time }) => (
            <div key={key} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{emoji}</span>
                <div><p className="font-semibold text-gray-900 text-sm">{label}</p><p className="text-xs text-gray-400">{time}</p></div>
              </div>
              <p className="text-sm text-gray-700">{menu[key]}</p>
            </div>
          ))}
        </div>
      </div>

      {activeDay === today && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">How was today's meal?</h2>
          <form onSubmit={handleFeedback} className="space-y-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)} className="transition-transform hover:scale-110">
                  <Star size={32} className={`${n <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} transition-colors`} />
                </button>
              ))}
              {rating > 0 && <span className="text-sm text-gray-500 ml-2">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</span>}
            </div>
            <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={2} placeholder="Any comments about today's meal? (optional)" className="input resize-none" />
            <button type="submit" disabled={submitting || !rating} className="btn-primary">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Feedback</>}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
