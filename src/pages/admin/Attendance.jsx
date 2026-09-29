import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { DEMO_SUBJECTS, DEMO_STUDENTS_ADMIN } from '../../data/demoData'

export default function AdminAttendance() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [studentsTracked, setStudentsTracked] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    if (user.isDemo) {
      setSubjects(DEMO_SUBJECTS.map(subject => ({ ...subject, pct: Math.round((subject.present / subject.total) * 100) })))
      setStudentsTracked(DEMO_STUDENTS_ADMIN.length)
      setLoading(false)
      setError('')
      return
    }
    if (!supabase) {
      setSubjects([])
      setStudentsTracked(0)
      setLoading(false)
      setError('Live attendance is unavailable because Supabase is not configured.')
      return
    }

    let active = true
    setLoading(true)
    setError('')
    supabase.from('attendance')
      .select('student_id,subject_id,total_classes,present_classes,subject:subjects(id,name,code,faculty)')
      .then(({ data, error: queryError }) => {
        if (!active) return
        if (queryError) {
          setError(`Could not load attendance: ${queryError.message}`)
          setSubjects([])
          setStudentsTracked(0)
        } else {
          const grouped = new Map()
          const studentIds = new Set()
          for (const row of data || []) {
            const subject = Array.isArray(row.subject) ? row.subject[0] : row.subject
            if (!subject) continue
            const item = grouped.get(subject.id) || { ...subject, total: 0, present: 0 }
            item.total += Number(row.total_classes) || 0
            item.present += Number(row.present_classes) || 0
            grouped.set(subject.id, item)
            studentIds.add(row.student_id)
          }
          setSubjects([...grouped.values()].map(subject => ({
            ...subject,
            pct: subject.total ? Math.round((subject.present / subject.total) * 100) : 0,
          })))
          setStudentsTracked(studentIds.size)
        }
        setLoading(false)
      })

    return () => { active = false }
  }, [user])

  const avgOverall = subjects.length ? Math.round(subjects.reduce((total, subject) => total + subject.pct, 0) / subjects.length) : 0

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Attendance Overview</h1><p className="text-gray-500 text-sm mt-1">Campus-wide attendance statistics</p></div>

      {loading && <div className="card text-sm text-gray-500">Loading campus attendance...</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {!loading && !error && subjects.length === 0 && <div className="card py-10 text-center text-sm text-gray-500">No campus attendance records have been published.</div>}
      {!loading && !error && subjects.length > 0 && <>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card text-center"><p className="text-3xl font-bold text-blue-600 mb-1">{avgOverall}%</p><p className="text-gray-500 text-sm">Average Attendance</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-orange-500 mb-1">{subjects.filter(s=>s.pct<80).length}</p><p className="text-gray-500 text-sm">Subjects Below 80%</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-green-600 mb-1">{studentsTracked}</p><p className="text-gray-500 text-sm">Students Tracked</p></div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Subject-wise Attendance</h2>
        <div className="space-y-4">
          {subjects.map(s => (
            <div key={s.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div><p className="text-sm font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-400">{s.code} • {s.faculty}</p></div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${s.pct<75?'text-red-600':s.pct<80?'text-orange-600':'text-green-600'}`}>{s.pct}%</p>
                  <p className="text-xs text-gray-400">{s.present}/{s.total}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${s.pct<75?'bg-red-500':s.pct<80?'bg-orange-500':'bg-green-500'}`} style={{width:`${s.pct}%`}} />
              </div>
              {s.pct<80 && <p className="text-xs text-orange-600 mt-1 flex items-center gap-1"><AlertCircle size={11}/> Below 80% threshold</p>}
            </div>
          ))}
        </div>
      </div>
      </>}
    </div>
  )
}
