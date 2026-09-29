import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { DEMO_TIMETABLE } from '../../data/demoData'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function classStatus(time) {
  const now = new Date()
  const [h, m] = time.split(':').map(Number)
  const t = new Date(); t.setHours(h, m, 0)
  const diff = (t - now) / 60000
  if (diff > 30) return { label: 'Upcoming', cls: 'bg-blue-100 text-blue-700' }
  if (diff >= -60) return { label: 'Current', cls: 'bg-green-100 text-green-700' }
  return { label: 'Completed', cls: 'bg-gray-100 text-gray-500' }
}

export default function TimetablePage() {
  const { user } = useAuth()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const [activeDay, setActiveDay] = useState(DAYS.includes(today) ? today : 'Monday')
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    if (user.isDemo) {
      setTimetable(DEMO_TIMETABLE)
      setLoading(false)
      setError('')
      return
    }
    if (!supabase) {
      setTimetable([])
      setLoading(false)
      setError('Live timetable is unavailable because Supabase is not configured.')
      return
    }
    if (!user.department) {
      setTimetable([])
      setLoading(false)
      setError('Add your department to your profile to load the correct timetable.')
      return
    }

    let active = true
    setLoading(true)
    setError('')
    const loadTimetable = async () => {
      const { data, error: queryError } = await supabase.from('timetable')
        .select('id,day,time,room,subject:subjects(name,faculty)')
        .eq('department', user.department)
        .order('time')
        if (!active) return
        if (queryError) {
          setError(`Could not load timetable: ${queryError.message}`)
          setTimetable([])
        } else {
          setTimetable((data || []).map(row => {
            const subject = Array.isArray(row.subject) ? row.subject[0] : row.subject
            return { ...row, subject: subject?.name || 'Subject', faculty: subject?.faculty || 'Faculty not assigned' }
          }))
        }
        setLoading(false)
    }

    loadTimetable()
    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadTimetable()
    }, 5000)

    return () => {
      active = false
      window.clearInterval(refreshInterval)
    }
  }, [user])

  const classes = timetable.filter(item => item.day === activeDay)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Timetable</h1><p className="text-gray-500 text-sm mt-1">Your weekly class schedule</p></div>
      <div className="card">
        {loading && <p className="py-8 text-center text-sm text-gray-500">Loading timetable...</p>}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {!loading && !error && timetable.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No timetable has been published for your department.</p>}
        {!loading && !error && timetable.length > 0 && <>
        <div className="flex gap-2 flex-wrap mb-6">
          {DAYS.map(d => (
            <button key={d} onClick={() => setActiveDay(d)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeDay === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {d.slice(0, 3)}{d === today && <span className="ml-1 text-xs opacity-75">(Today)</span>}
            </button>
          ))}
        </div>
        {classes.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-400">No classes on {activeDay}</p></div>
        ) : (
          <div className="space-y-3">
            {classes.map(cls => {
              const s = activeDay === today ? classStatus(cls.time) : null
              return (
                <div key={cls.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${s?.label === 'Current' ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm font-bold text-gray-900">{cls.time}</p>
                    <p className="text-xs text-gray-400">AM/PM</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{cls.subject}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={11} />{cls.room}</span>
                      <span>{cls.faculty}</span>
                    </div>
                  </div>
                  {s && <span className={`badge ${s.cls} text-xs`}>{s.label}</span>}
                </div>
              )
            })}
          </div>
        )}
        </>}
      </div>
    </div>
  )
}
