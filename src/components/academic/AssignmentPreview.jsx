import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Download, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { DEMO_ACADEMIC_RESOURCES } from '../../data/demoData'

const BUCKET = 'academic-resources'

export default function AssignmentPreview() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(!user?.isDemo && Boolean(supabase))
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const department = user?.department
  const isDemo = user?.isDemo

  useEffect(() => {
    if (isDemo || !supabase) return undefined
    let active = true
    const loadAssignments = async () => {
      let query = supabase
        .from('academic_resources')
        .select('id,title,description,department,course,semester,subject,file_url,file_name,demo_sample,created_at')
        .eq('resource_type', 'assignment')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(3)
      if (department) query = query.eq('department', department)

      try {
        const { data, error: queryError } = await query
        if (!active) return
        if (queryError) {
          setItems([])
          setError(`Could not load assignment PDFs: ${queryError.message}`)
        } else {
          setItems(data || [])
          setError('')
        }
      } catch (queryError) {
        if (!active) return
        setItems([])
        setError(`Could not load assignment PDFs: ${queryError.message || 'The request failed.'}`)
      }
      if (active) setLoading(false)
    }
    loadAssignments()
    return () => { active = false }
  }, [department, isDemo, reloadToken])

  const download = async item => {
    if (!item.file_url || downloading) return
    setDownloading(item.id)
    setError('')
    try {
      const { data, error: downloadError } = await supabase.storage.from(BUCKET).download(item.file_url)
      if (downloadError) throw downloadError
      if (!data) throw new Error('The assignment PDF could not be retrieved.')
      const objectUrl = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = item.file_name || `${item.title}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch (downloadError) {
      setError(`Could not download "${item.title}": ${downloadError.message}`)
    } finally {
      setDownloading('')
    }
  }

  const visibleItems = isDemo
    ? DEMO_ACADEMIC_RESOURCES.filter(item => item.resource_type === 'assignment').slice(0, 3)
    : items

  return (
    <section className="card space-y-3" aria-labelledby="dashboard-assignments-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-violet-100 p-2.5 text-violet-700"><ClipboardList size={19} /></span>
          <div>
            <h2 id="dashboard-assignments-heading" className="font-semibold text-gray-900">Assignment PDFs</h2>
            <p className="text-xs text-gray-500">Latest approved assignments for your department</p>
          </div>
        </div>
        <Link to="/student/assignments" className="text-xs font-semibold text-violet-700 hover:underline">View all assignments →</Link>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!isDemo && !supabase && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-gray-700">Assignment PDFs are unavailable because Supabase is not configured.</p>}
      {error && supabase && <button type="button" onClick={() => { setLoading(true); setError(''); setReloadToken(token => token + 1) }} className="text-sm font-semibold text-violet-700 hover:underline">Retry loading assignments</button>}
      {loading ? <p className="py-3 text-sm text-gray-500">Loading assignments…</p> : visibleItems.length === 0 ? (
        <p className="py-3 text-sm text-gray-500">No approved assignment PDFs are available yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {visibleItems.map(item => (
            <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-1 last:pb-1">
              <div className="flex min-w-0 items-center gap-3">
                <FileText size={18} className="shrink-0 text-violet-600" />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium text-gray-900">{item.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-gray-500">{[item.subject, item.course, item.semester ? `Semester ${item.semester}` : null].filter(Boolean).join(' · ')}</p>
                  {item.demo_sample && <span className="mt-1 inline-block text-xs text-violet-700">Demo sample · no file attached</span>}
                </div>
              </div>
              {item.file_url && <button type="button" onClick={() => download(item)} disabled={Boolean(downloading)} className="secondary-button shrink-0 justify-center">
                <Download size={14} /> {downloading === item.id ? 'Downloading…' : 'Download PDF'}
              </button>}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
