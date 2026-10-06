import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, MapPin } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { DEMO_TIMETABLE } from '../../data/demoData'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const selectClass = 'rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-400'

function legacyTime(row) {
  const raw = row.time || ''
  const parts = raw.split(/\s*(?:-|–|to)\s*/i)
  const formatTime = value => /^\d{2}:\d{2}(?::\d{2})?$/.test(value || '') ? value.slice(0, 5) : value
  return {
    start: formatTime(row.start_time || parts[0] || ''),
    end: formatTime(row.end_time || parts[1] || ''),
  }
}

function normalizeRow(row) {
  const time = legacyTime(row)
  return {
    ...row,
    day_of_week: row.day_of_week || row.day || '',
    start_time: time.start,
    end_time: time.end,
    subject: row.subject || 'Subject',
    faculty_name: row.faculty_name || row.faculty || 'Faculty not assigned',
    room: row.room || 'Room not assigned',
  }
}

function demoEntries(user) {
  return DEMO_TIMETABLE.map(row => ({
    ...row,
    start_time: row.time,
    end_time: `${String(Number(row.time.split(':')[0]) + 1).padStart(2, '0')}:${row.time.split(':')[1]}`,
    faculty_name: row.faculty,
    semester: user?.semester,
    section: user?.section,
    department: user?.department,
  }))
}

export default function TimetablePage() {
  const { user } = useAuth()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const [entries, setEntries] = useState(() => user?.isDemo ? demoEntries(user) : [])
  const [loading, setLoading] = useState(!user?.isDemo && Boolean(supabase && user?.department))
  const [error, setError] = useState(!user?.isDemo && !supabase ? 'Live timetable is unavailable because Supabase is not configured.' : '')
  const [activeDay, setActiveDay] = useState(DAYS.includes(today) ? today : 'Monday')
  const [view, setView] = useState('week')
  const [filters, setFilters] = useState({
    department: user?.department || '',
    semester: user?.semester ? String(user.semester) : '',
    section: user?.section || '',
  })

  const load = useCallback(async () => {
    if (!user) return
    if (user.isDemo) return
    if (!supabase) {
      return
    }
    if (!user.department) {
      return
    }
    let query = supabase.from('timetable').select('*').eq('department', user.department).order('start_time')
    if (user.semester) query = query.eq('semester', user.semester)
    if (user.section) query = query.eq('section', user.section)
    const { data, error: queryError } = await query
    if (queryError) {
      setError(`Could not load timetable: ${queryError.message}`)
      setEntries([])
    } else {
      setError('')
      setEntries((data || []).map(normalizeRow))
    }
    setLoading(false)
  }, [user, setEntries, setError, setLoading])

  useEffect(() => { load() }, [load])

  const departmentOptions = useMemo(() => [...new Set(entries.map(row => row.department).filter(Boolean))], [entries])
  const sectionOptions = useMemo(() => [...new Set(entries.map(row => row.section).filter(Boolean))], [entries])
  const matchingEntries = entries.filter(row =>
    (!filters.department || row.department === filters.department)
    && (!filters.semester || String(row.semester || '') === filters.semester)
    && (!filters.section || row.section === filters.section)
  )
  const byDay = day => matchingEntries.filter(row => row.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time))
  const dailyEntries = byDay(activeDay)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><CalendarDays className="text-violet-700" />Timetable</h1>
          <p className="mt-1 text-sm text-gray-500">Your weekly and daily class schedule</p>
        </div>
        <div className="flex rounded-xl bg-violet-100 p-1">
          {['week', 'day'].map(option => <button key={option} onClick={() => setView(option)} className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${view === option ? 'bg-white text-violet-800 shadow-sm' : 'text-violet-600'}`}>{option === 'week' ? 'Weekly' : 'Daily'}</button>)}
        </div>
      </div>

      <div className="card grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-xs text-gray-500">Department
          <select className={`${selectClass} w-full`} value={filters.department} onChange={event => setFilters(current => ({ ...current, department: event.target.value }))}>
            <option value="">All departments</option>
            {departmentOptions.map(value => <option key={value}>{value}</option>)}
            {user?.department && !departmentOptions.includes(user.department) && <option>{user.department}</option>}
          </select>
        </label>
        <label className="space-y-1 text-xs text-gray-500">Semester
          <select className={`${selectClass} w-full`} value={filters.semester} onChange={event => setFilters(current => ({ ...current, semester: event.target.value }))}>
            <option value="">All semesters</option>
            {Array.from({ length: 12 }, (_, index) => String(index + 1)).map(value => <option key={value} value={value}>Semester {value}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs text-gray-500">Section
          <select className={`${selectClass} w-full`} value={filters.section} onChange={event => setFilters(current => ({ ...current, section: event.target.value }))}>
            <option value="">All sections</option>
            {sectionOptions.map(value => <option key={value}>{value}</option>)}
            {user?.section && !sectionOptions.includes(user.section) && <option>{user.section}</option>}
          </select>
        </label>
      </div>

      {loading ? <div className="card"><LoadingState message="Loading your timetable…" /></div> : error || (!user?.department && !user?.isDemo) ? <div className="card"><ErrorState message={error || 'Add your department to your profile to load the correct timetable.'} onRetry={load} /></div> : matchingEntries.length === 0 ? (
        <div className="card"><EmptyState message="No timetable has been published for your department, semester, and section." icon={CalendarDays} /></div>
      ) : (
        <div className="card">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {DAYS.map(day => <button key={day} onClick={() => setActiveDay(day)} className={`shrink-0 rounded-xl px-3 py-2 text-sm font-medium ${activeDay === day ? 'bg-violet-700 text-white' : 'bg-violet-50 text-violet-700 hover:bg-violet-100'}`}>{day.slice(0, 3)}{day === today ? ' · Today' : ''}</button>)}
          </div>
          {view === 'day' ? (
            dailyEntries.length === 0 ? <EmptyState message={`No classes scheduled on ${activeDay}.`} icon={CalendarDays} /> : (
              <div className="space-y-3">
                {dailyEntries.map(entry => <ClassCard key={entry.id} entry={entry} />)}
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <div className="grid min-w-[980px] grid-cols-7 gap-2">
                {DAYS.map(day => (
                  <section key={day} className="min-h-48 rounded-xl bg-violet-50/70 p-2">
                    <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-violet-800">{day}</h2>
                    <div className="space-y-2">
                      {byDay(day).length === 0 ? <p className="px-1 py-3 text-center text-xs text-gray-400">No classes</p> : byDay(day).map(entry => (
                        <article key={entry.id} className="rounded-xl border border-violet-100 bg-white p-2.5 shadow-sm">
                          <p className="text-[11px] font-semibold text-violet-700">{entry.start_time || 'Time TBD'}{entry.end_time ? `–${entry.end_time}` : ''}</p>
                          <p className="mt-1 text-xs font-semibold leading-snug text-gray-900">{entry.subject}</p>
                          <p className="mt-1 text-[11px] text-gray-500">{entry.faculty_name}</p>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-500"><MapPin size={10} />{entry.room}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ClassCard({ entry }) {
  return (
    <article className="flex flex-wrap items-center gap-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
      <div className="min-w-24 text-sm font-semibold text-violet-800">{entry.start_time || 'Time TBD'}{entry.end_time ? ` – ${entry.end_time}` : ''}</div>
      <div className="hidden h-10 w-px bg-violet-200 sm:block" />
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-gray-900">{entry.subject}</h2>
        <p className="mt-1 text-sm text-gray-600">{entry.faculty_name}</p>
      </div>
      <span className="flex items-center gap-1.5 text-sm text-gray-600"><MapPin size={15} />{entry.room}</span>
      <span className="flex items-center gap-1.5 text-sm text-gray-500"><Clock3 size={15} />{entry.department}{entry.section ? ` · ${entry.section}` : ''}</span>
    </article>
  )
}
