import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendarDays, Clock3, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import Modal from '../../components/ui/Modal'
import { supabase } from '../../lib/supabase'
import { DEMO_TIMETABLE } from '../../data/demoData'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const EMPTY = { department: '', course: '', semester: '', section: '', subject: '', faculty_id: '', faculty_name: '', room: '', day_of_week: 'Monday', start_time: '', end_time: '', academic_year: '' }
const inputClass = 'w-full rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100'

function demoTimetableRows() {
  return DEMO_TIMETABLE.map(row => ({
    id: row.id,
    day: row.day,
    day_of_week: row.day,
    start_time: row.time,
    end_time: `${String((Number(row.time.slice(0, 2)) + 1) % 24).padStart(2, '0')}:${row.time.slice(3, 5)}`,
    room: row.room,
    subject: row.subject,
    faculty_name: row.faculty,
    semester: 6,
    section: 'A',
    department: 'Computer Science',
    course: 'B.Tech CSE',
    academic_year: '2025-2026',
  }))
}

export default function TimetableManagement({ view = 'manage' }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const toast = useToast()
  const isAdmin = user?.admin_role === 'main_administrator'
  const isFaculty = user?.admin_role === 'faculty'
  const [rows, setRows] = useState(() => user?.isDemo ? demoTimetableRows() : [])
  const [assignments, setAssignments] = useState([])
  const [facultyProfiles, setFacultyProfiles] = useState([])
  const [loading, setLoading] = useState(Boolean(supabase) && !user?.isDemo)
  const [error, setError] = useState(user?.isDemo || supabase ? '' : 'Timetable management requires a configured Supabase project.')
  const [editor, setEditor] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todayView = view === 'today' || pathname.endsWith('/classes')
  const [dayFilter, setDayFilter] = useState(() => todayView ? today : '')

  const load = useCallback(async () => {
    if (user?.isDemo) return
    if (!supabase) {
      return
    }
    const [timetableResult, assignmentResult] = await Promise.all([
      supabase.from('timetable').select('*').order('day_of_week').order('start_time'),
      isFaculty ? supabase.from('faculty_subjects').select('*').order('subject') : Promise.resolve({ data: [], error: null }),
    ])
    if (timetableResult.error) {
      setError(`Could not load timetable: ${timetableResult.error.message}`)
      setRows([])
    } else {
      if (!assignmentResult.error) setError('')
      setRows(timetableResult.data || [])
    }
    if (assignmentResult.error) setError(`Could not load your subject permissions: ${assignmentResult.error.message}`)
    else setAssignments(assignmentResult.data || [])
    if (isAdmin) {
      const { data, error: profileError } = await supabase.from('profiles').select('id,name,email').eq('role', 'admin').eq('admin_role', 'faculty').order('name')
      if (profileError) setError(`Could not load faculty accounts: ${profileError.message}`)
      else setFacultyProfiles(data || [])
    }
    setLoading(false)
  }, [isAdmin, isFaculty, user?.isDemo])

  useEffect(() => { load() }, [load])

  const setValue = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const openEditor = row => {
    setEditing(row || null)
    setForm(row ? {
      ...EMPTY,
      department: row.department || '',
      course: row.course || '',
      semester: row.semester ? String(row.semester) : '',
      section: row.section || '',
      subject: row.subject || '',
      faculty_id: row.faculty_id || '',
      faculty_name: row.faculty_name || (isFaculty ? user.name : ''),
      room: row.room || '',
      day_of_week: row.day_of_week || row.day || 'Monday',
      start_time: row.start_time || '',
      end_time: row.end_time || '',
      academic_year: row.academic_year || '',
    } : {
      ...EMPTY,
      department: user?.department || '',
      course: user?.branch || '',
      semester: user?.semester ? String(user.semester) : '',
      section: user?.section || '',
      faculty_id: isFaculty ? user.id : '',
      faculty_name: user?.name || '',
    })
    setEditor(true)
  }

  const save = async event => {
    event.preventDefault()
    if (!supabase || saving) return
    if (form.end_time <= form.start_time) {
      toast('Invalid class time', 'The class end time must be later than its start time.', 'warning')
      return
    }
    setSaving(true)
    const payload = {
      department: form.department.trim(),
      course: form.course.trim(),
      semester: Number(form.semester),
      section: form.section.trim() || null,
      subject: form.subject.trim(),
      faculty_id: isFaculty ? user.id : form.faculty_id || null,
      faculty_name: isFaculty ? user.name : form.faculty_name.trim() || null,
      room: form.room.trim() || null,
      day_of_week: form.day_of_week,
      day: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
      time: `${form.start_time} - ${form.end_time}`,
      academic_year: form.academic_year.trim() || null,
      updated_at: new Date().toISOString(),
    }
    const result = editing
      ? await supabase.from('timetable').update(payload).eq('id', editing.id)
      : await supabase.from('timetable').insert(payload)
    if (result.error) toast('Could not save timetable entry', result.error.message, 'error')
    else {
      toast(editing ? 'Timetable entry updated' : 'Timetable entry added', `${payload.subject} · ${payload.day_of_week}`, 'success')
      setEditor(false)
      await load()
    }
    setSaving(false)
  }

  const remove = async row => {
    if (!window.confirm(`Delete ${row.subject} on ${row.day_of_week || row.day}? This cannot be undone.`)) return
    const { error: deleteError } = await supabase.from('timetable').delete().eq('id', row.id)
    if (deleteError) toast('Could not delete timetable entry', deleteError.message, 'error')
    else {
      toast('Timetable entry deleted', row.subject, 'success')
      await load()
    }
  }

  const visibleRows = rows
    .filter(row => !dayFilter || (row.day_of_week || row.day) === dayFilter)
    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
  const owns = row => !user?.isDemo && (isAdmin || (isFaculty && row.faculty_id === user?.id))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><CalendarDays className="text-violet-700" />{todayView ? "Today's Classes" : 'Timetable Management'}</h1>
          <p className="mt-1 text-sm text-gray-500">{todayView ? 'See today’s class times, subjects, rooms, and teachers.' : isAdmin ? 'Create and maintain the campus weekly timetable.' : 'Manage timetable entries for subjects assigned to you.'}</p>
        </div>
        {!todayView && !user?.isDemo && <button onClick={() => openEditor()} className="primary-button"><Plus size={16} /> Add class</button>}
      </div>
      {user?.isDemo && <p className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">Demo mode · showing sample classes. Editing and publishing require a live campus account.</p>}
      <div className="flex flex-wrap gap-2">
        {!todayView && <button onClick={() => setDayFilter('')} className={`rounded-xl px-3 py-2 text-sm ${!dayFilter ? 'bg-violet-700 text-white' : 'bg-white text-gray-600'}`}>All days</button>}
        {DAYS.map(day => <button key={day} onClick={() => setDayFilter(day)} className={`rounded-xl px-3 py-2 text-sm ${dayFilter === day ? 'bg-violet-700 text-white' : 'bg-white text-gray-600'}`}>{day.slice(0, 3)}</button>)}
      </div>
      {loading ? <LoadingState message="Loading timetable entries…" /> : error ? <ErrorState message={error} onRetry={load} /> : visibleRows.length === 0 ? (
        <div className="card"><EmptyState message={rows.length ? 'There are no classes on this day.' : 'No timetable entries are available yet.'} icon={CalendarDays} /></div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleRows.map(row => (
            <article key={row.id} className="card">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div><span className="text-xs font-medium text-violet-700">{row.day_of_week || row.day} · Semester {row.semester || '—'} · Section {row.section || '—'}</span><h2 className="mt-1 font-semibold text-gray-900">{row.subject || 'Class'}</h2></div>
                {owns(row) && <div className="flex gap-1"><button onClick={() => openEditor(row)} className="rounded-lg p-2 text-violet-700 hover:bg-violet-50" title="Edit"><Pencil size={15} /></button><button onClick={() => remove(row)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={15} /></button></div>}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><Clock3 size={15} className="text-violet-500" />{row.start_time?.slice(0, 5) || 'Time TBD'}{row.end_time ? ` – ${row.end_time.slice(0, 5)}` : ''}</p>
                <p className="flex items-center gap-2"><MapPin size={15} className="text-violet-500" />{row.room || 'Room not assigned'}</p>
                <p>{row.faculty_name || 'Faculty not assigned'} · {row.department || 'Department'}{row.academic_year ? ` · ${row.academic_year}` : ''}</p>
              </div>
            </article>
          ))}
        </div>
      )}
      <Modal isOpen={editor} onClose={() => setEditor(false)} title={`${editing ? 'Edit' : 'Add'} timetable entry`} size="lg">
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs text-gray-500">Department<input required className={inputClass} value={form.department} onChange={event => setValue('department', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500">Course<input required className={inputClass} value={form.course} onChange={event => setValue('course', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500">Semester<input required min="1" max="12" type="number" className={inputClass} value={form.semester} onChange={event => setValue('semester', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500">Section<input className={inputClass} value={form.section} onChange={event => setValue('section', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500">Subject
            {isFaculty ? <select required className={inputClass} value={`${form.department}|${form.course}|${form.semester}|${form.subject}`} onChange={event => {
              const assignment = assignments.find(item => `${item.department}|${item.course}|${item.semester}|${item.subject}` === event.target.value)
              if (assignment) setForm(current => ({ ...current, department: assignment.department, course: assignment.course, semester: String(assignment.semester), subject: assignment.subject }))
            }}><option value="">Select assigned subject</option>{assignments.map(item => <option key={item.id} value={`${item.department}|${item.course}|${item.semester}|${item.subject}`}>{item.subject} · {item.department} · Semester {item.semester}</option>)}</select>
              : <input required className={inputClass} value={form.subject} onChange={event => setValue('subject', event.target.value)} />}
          </label>
          <label className="space-y-1 text-xs text-gray-500">Faculty{isAdmin ? (
            <select className={inputClass} value={form.faculty_id} onChange={event => {
              const faculty = facultyProfiles.find(person => person.id === event.target.value)
              setForm(current => ({ ...current, faculty_id: event.target.value, faculty_name: faculty?.name || '' }))
            }}><option value="">Not assigned</option>{facultyProfiles.map(person => <option key={person.id} value={person.id}>{person.name} · {person.email}</option>)}</select>
          ) : <input required className={inputClass} disabled value={form.faculty_name} />}</label>
          <label className="space-y-1 text-xs text-gray-500">Room<input className={inputClass} value={form.room} onChange={event => setValue('room', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500">Day<select className={inputClass} value={form.day_of_week} onChange={event => setValue('day_of_week', event.target.value)}>{DAYS.map(day => <option key={day}>{day}</option>)}</select></label>
          <label className="space-y-1 text-xs text-gray-500">Start time<input required type="time" className={inputClass} value={form.start_time} onChange={event => setValue('start_time', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500">End time<input required type="time" className={inputClass} value={form.end_time} onChange={event => setValue('end_time', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500">Academic year<input className={inputClass} placeholder="2026-2027" value={form.academic_year} onChange={event => setValue('academic_year', event.target.value)} /></label>
          <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="secondary-button" onClick={() => setEditor(false)}>Cancel</button><button disabled={saving} className="primary-button">{saving ? 'Saving…' : 'Save entry'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
