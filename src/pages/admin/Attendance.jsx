import { DEMO_SUBJECTS, DEMO_STUDENTS_ADMIN } from '../../data/demoData'
import { AlertCircle } from 'lucide-react'

export default function AdminAttendance() {
  const subjects = DEMO_SUBJECTS.map(s => ({ ...s, pct: Math.round((s.present/s.total)*100) }))
  const avgOverall = Math.round(subjects.reduce((a,s)=>a+s.pct,0)/subjects.length)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Attendance Overview</h1><p className="text-gray-500 text-sm mt-1">Campus-wide attendance statistics</p></div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card text-center"><p className="text-3xl font-bold text-blue-600 mb-1">{avgOverall}%</p><p className="text-gray-500 text-sm">Average Attendance</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-orange-500 mb-1">{subjects.filter(s=>s.pct<80).length}</p><p className="text-gray-500 text-sm">Subjects Below 80%</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-green-600 mb-1">{DEMO_STUDENTS_ADMIN.length}</p><p className="text-gray-500 text-sm">Students Tracked</p></div>
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
    </div>
  )
}
