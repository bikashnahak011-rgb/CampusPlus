import { ArrowUpRight, BookOpen, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CampusJournalPreview({ items = [], admin = false }) {
  const navigate = useNavigate()
  const published = items.filter(item => item.status === 'published')
  const featured = published.filter(item => item.is_featured)
  const previewItems = [...featured, ...published.filter(item => !item.is_featured)].slice(0, 3)
  const pendingCount = items.filter(item => item.status === 'pending').length
  const path = admin ? '/admin/campus-journal' : '/student/campus-journal'

  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><BookOpen size={19} /></div><div><h2 className="font-semibold text-gray-900">Campus Journal</h2><p className="mt-0.5 text-xs text-gray-500">Stories, achievements, and publications</p></div></div>
        <button type="button" onClick={() => navigate(path)} className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900">{admin ? 'Manage journal' : 'Explore journal'}<ArrowUpRight size={14} /></button>
      </div>
      {admin && pendingCount > 0 && <button type="button" onClick={() => navigate(path)} className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-left text-xs font-semibold text-amber-800 hover:bg-amber-100">{pendingCount} submission{pendingCount === 1 ? '' : 's'} need review</button>}
      {previewItems.length ? <div className="mt-4 grid gap-3 md:grid-cols-3">
        {previewItems.map(item => <button key={item.id} type="button" onClick={() => navigate(path)} className="rounded-xl border border-violet-100 bg-white/80 p-3 text-left transition-colors hover:border-violet-300 hover:bg-violet-50/60">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-violet-700">{item.is_featured && <Star size={12} fill="currentColor" />} {item.is_featured ? 'Featured' : item.category}</span>
          <span className="mt-1 block text-sm font-semibold text-gray-900">{item.title}</span>
          <span className="mt-1 block line-clamp-2 text-xs leading-5 text-gray-500">{item.summary}</span>
        </button>)}
      </div> : <p className="mt-4 text-sm text-gray-500">No published journal entries yet.</p>}
    </section>
  )
}