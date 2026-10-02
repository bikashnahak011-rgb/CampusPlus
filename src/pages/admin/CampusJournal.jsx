import { useState } from 'react'
import { BookOpen, Check, Star, X } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'

const FILTERS = [
  { id: 'pending', label: 'Needs review' },
  { id: 'published', label: 'Published' },
  { id: 'rejected', label: 'Rejected' },
]

export default function AdminCampusJournal() {
  const { campusJournalItems, campusJournalError, reviewCampusJournalItem, setCampusJournalFeatured } = useApp()
  const toast = useToast()
  const [filter, setFilter] = useState('pending')
  const [busyId, setBusyId] = useState('')
  const visibleItems = campusJournalItems.filter(item => item.status === filter)
  const pendingCount = campusJournalItems.filter(item => item.status === 'pending').length

  const review = async (item, status) => {
    setBusyId(item.id)
    try {
      await reviewCampusJournalItem(item.id, status)
      toast(status === 'published' ? 'Journal entry published.' : 'Submission rejected.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setBusyId('')
    }
  }

  const toggleFeatured = async item => {
    setBusyId(item.id)
    try {
      await setCampusJournalFeatured(item.id, !item.is_featured)
      toast(item.is_featured ? 'Removed from featured publications.' : 'Added to featured publications.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><BookOpen size={22} /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Campus Journal</h1><p className="mt-1 text-sm text-gray-500">Review student submissions and manage published stories</p></div>
      </div>

      {campusJournalError && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{campusJournalError}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        {FILTERS.map(({ id, label }) => <button key={id} type="button" onClick={() => setFilter(id)} className={`rounded-xl border px-4 py-3 text-left transition-colors ${filter === id ? 'border-violet-300 bg-violet-50' : 'border-gray-100 bg-white hover:border-violet-200'}`}><span className="block text-xl font-bold text-gray-900">{campusJournalItems.filter(item => item.status === id).length}</span><span className="text-xs text-gray-500">{label}</span></button>)}
      </div>
      {pendingCount > 0 && <p className="text-sm font-medium text-amber-800">{pendingCount} submission{pendingCount === 1 ? '' : 's'} awaiting your review.</p>}

      <div className="flex gap-2 border-b border-gray-200">
        {FILTERS.map(({ id, label }) => <button key={id} type="button" onClick={() => setFilter(id)} className={`border-b-2 px-3 py-2 text-sm font-semibold ${filter === id ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>{label}</button>)}
      </div>

      {visibleItems.length ? <div className="space-y-3">
        {visibleItems.map(item => (
          <article key={item.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{item.category}</span>{item.subcategory && <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700">{item.subcategory}</span>}{item.is_featured && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"><Star size={12} fill="currentColor" /> Featured</span>}</div>
                <h2 className="mt-3 text-lg font-semibold text-gray-900">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">{item.summary}</p>
                <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-violet-700">Read full submission</summary><p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">{item.content}</p></details>
                <p className="mt-3 text-xs text-gray-400">Submitted by {item.author_name || 'Student'} · {new Date(item.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {item.status !== 'published' && <button type="button" disabled={busyId === item.id} onClick={() => review(item, 'published')} className="btn-primary !min-h-0 !w-auto px-3 py-2 text-xs disabled:opacity-60"><Check size={14} /> Publish</button>}
                {item.status === 'pending' && <button type="button" disabled={busyId === item.id} onClick={() => review(item, 'rejected')} className="btn-secondary !min-h-0 !w-auto px-3 py-2 text-xs text-red-700 disabled:opacity-60"><X size={14} /> Reject</button>}
                {item.status === 'published' && <button type="button" disabled={busyId === item.id} onClick={() => toggleFeatured(item)} className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:opacity-60 ${item.is_featured ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-gray-200 bg-white text-gray-600 hover:border-amber-200 hover:text-amber-800'}`}><Star size={14} fill={item.is_featured ? 'currentColor' : 'none'} />{item.is_featured ? 'Unfeature' : 'Feature'}</button>}
              </div>
            </div>
          </article>
        ))}
      </div> : <div className="card py-12 text-center"><BookOpen size={30} className="mx-auto text-violet-300" /><p className="mt-3 text-sm font-semibold text-gray-700">No {FILTERS.find(item => item.id === filter)?.label.toLowerCase()} entries</p></div>}
    </div>
  )
}