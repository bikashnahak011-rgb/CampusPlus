import { useState } from 'react'
import { BookOpen, Plus, Send, Star } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { CAMPUS_JOURNAL_CATEGORIES, CAMPUS_JOURNAL_SUBCATEGORIES } from '../../lib/campusJournal'

const EMPTY_DRAFT = { title: '', category: '', subcategory: '', summary: '', content: '' }

function EntryCard({ item, ownSubmission = false }) {
  return (
    <article className="card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{item.category}</span>
        {item.subcategory && <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700">{item.subcategory}</span>}
        {item.is_featured && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><Star size={12} fill="currentColor" /> Featured</span>}
        {ownSubmission && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'published' ? 'bg-green-50 text-green-700' : item.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span>}
      </div>
      <h2 className="mt-3 text-lg font-semibold text-gray-900">{item.title}</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">{item.summary}</p>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold text-violet-700 hover:text-violet-900">Read story</summary>
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">{item.content}</p>
      </details>
      <p className="mt-4 text-xs text-gray-400">By {item.author_name || 'Campus Journal'} · {new Date(item.created_at).toLocaleDateString('en-IN')}</p>
      {item.status === 'rejected' && item.review_note && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">Admin note: {item.review_note}</p>}
    </article>
  )
}

export default function CampusJournalPage() {
  const { user } = useAuth()
  const { campusJournalItems, campusJournalError, submitCampusJournalItem } = useApp()
  const toast = useToast()
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const subcategories = CAMPUS_JOURNAL_SUBCATEGORIES[draft.category] || []
  const publishedItems = campusJournalItems.filter(item => item.status === 'published')
  const mySubmissions = campusJournalItems.filter(item => item.student_id === user?.id && item.status !== 'published')
  const visibleItems = [
    ...publishedItems.filter(item => filter === 'All'
      || (filter === 'Featured Publications' ? item.is_featured : item.category === filter)),
    ...mySubmissions.filter(item => filter === 'All' || item.category === filter),
  ]

  const handleSubmit = async event => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await submitCampusJournalItem(draft)
      setDraft(EMPTY_DRAFT)
      setShowForm(false)
      toast('Your submission has been sent to the admin for review.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><BookOpen size={22} /></div>
          <div><h1 className="text-2xl font-bold text-gray-900">Campus Journal</h1><p className="mt-1 text-sm text-gray-500">Campus stories, achievements, and publications</p></div>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary sm:!w-auto"><Plus size={17} /> Submit a story</button>
      </div>

      {campusJournalError && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{campusJournalError}</p>}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['All', 'Featured Publications', ...CAMPUS_JOURNAL_CATEGORIES].map(category => (
          <button key={category} type="button" onClick={() => setFilter(category)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${filter === category ? 'bg-violet-700 text-white' : 'bg-white text-gray-600 hover:bg-violet-50'}`}>{category}</button>
        ))}
      </div>

      {visibleItems.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleItems.map(item => <EntryCard key={item.id} item={item} ownSubmission={item.student_id === user?.id && item.status !== 'published'} />)}
        </div>
      ) : (
        <div className="card py-12 text-center"><BookOpen size={30} className="mx-auto text-violet-300" /><p className="mt-3 text-sm font-semibold text-gray-700">No journal stories here yet</p><p className="mt-1 text-xs text-gray-500">Published entries will appear here after admin approval.</p></div>
      )}

      {mySubmissions.length > 0 && filter !== 'All' && !visibleItems.some(item => item.status !== 'published') && <p className="text-xs text-gray-500">Your pending submissions are shown under All.</p>}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Submit to Campus Journal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Title *<input required minLength={3} maxLength={160} value={draft.title} onChange={event => setDraft(previous => ({ ...previous, title: event.target.value }))} className="input mt-1" placeholder="Give your story a title" /></label>
          <label className="block text-sm font-medium text-gray-700">Section *<select required value={draft.category} onChange={event => setDraft(previous => ({ ...previous, category: event.target.value, subcategory: '' }))} className="input mt-1"><option value="">Choose a section</option>{CAMPUS_JOURNAL_CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label>
          {subcategories.length > 0 && <label className="block text-sm font-medium text-gray-700">Publication type *<select required value={draft.subcategory} onChange={event => setDraft(previous => ({ ...previous, subcategory: event.target.value }))} className="input mt-1"><option value="">Choose a type</option>{subcategories.map(subcategory => <option key={subcategory}>{subcategory}</option>)}</select></label>}
          <label className="block text-sm font-medium text-gray-700">Short summary *<textarea required minLength={10} maxLength={320} rows={2} value={draft.summary} onChange={event => setDraft(previous => ({ ...previous, summary: event.target.value }))} className="input mt-1 resize-y" placeholder="A short introduction to your submission" /></label>
          <label className="block text-sm font-medium text-gray-700">Story or publication text *<textarea required minLength={20} maxLength={12000} rows={7} value={draft.content} onChange={event => setDraft(previous => ({ ...previous, content: event.target.value }))} className="input mt-1 resize-y" placeholder="Write your article, poem, story, or publication description" /></label>
          <p className="text-xs text-gray-500">Submissions stay private until an admin approves them.</p>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60"><Send size={15} />{submitting ? 'Submitting...' : 'Send for review'}</button></div>
        </form>
      </Modal>
    </div>
  )
}