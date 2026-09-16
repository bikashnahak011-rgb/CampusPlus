import { AlertCircle, CheckCircle } from 'lucide-react'
import { DEMO_SUBJECTS } from '../../data/demoData'

export default function AttendancePage() {
  const subjects = DEMO_SUBJECTS.map(s => ({ ...s, pct: Math.round((s.present / s.total) * 100) }))
  const avg = Math.round(subjects.reduce((a, s) => a + s.pct, 0) / subjects.length)
  const low = subjects.filter(s => s.pct < 80)
  const totalPresent = subjects.reduce((a, s) => a + s.present, 0)
  const totalAbsent = subjects.reduce((a, s) => a + (s.total - s.present), 0)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Attendance</h1><p className="text-gray-500 text-sm mt-1">Subject-wise attendance overview</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray={`${avg} ${100 - avg}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold text-gray-900">{avg}%</span></div>
          </div>
          <p className="font-semibold text-gray-900">Overall Attendance</p>
        </div>
        <div className="card text-center"><p className="text-3xl font-bold text-green-600 mb-1">{totalPresent}</p><p className="text-gray-500 text-sm">Total Classes Present</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-red-500 mb-1">{totalAbsent}</p><p className="text-gray-500 text-sm">Total Classes Absent</p></div>
      </div>
      {low.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2"><AlertCircle size={18} className="text-orange-600" /><p className="font-semibold text-orange-800">Attendance Warning</p></div>
          {low.map(s => <p key={s.id} className="text-sm text-orange-700">⚠ Your {s.name} attendance is below 80% ({s.pct}%).</p>)}
        </div>
      )}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Subject-wise Attendance</h2>
        <div className="space-y-5">
          {subjects.map(s => (
            <div key={s.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div><p className="text-sm font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-400">{s.code} • {s.faculty}</p></div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${s.pct < 75 ? 'text-red-600' : s.pct < 80 ? 'text-orange-600' : 'text-green-600'}`}>{s.pct}%</p>
                  <p className="text-xs text-gray-400">{s.present}/{s.total}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${s.pct < 75 ? 'bg-red-500' : s.pct < 80 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${s.pct}%` }} />
              </div>
              {s.pct < 80 && <p className="text-xs text-orange-600 mt-1 flex items-center gap-1"><AlertCircle size={11} /> Need {Math.max(0, Math.ceil((0.75 * s.total - s.present) / 0.25))} more classes to reach 75%</p>}
            </div>
          ))}
        </div>
      </div>
      <div className="card overflow-x-auto">
        <h2 className="font-semibold text-gray-900 mb-4">Detailed Summary</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100">{['Subject', 'Code', 'Total', 'Present', 'Absent', '%', 'Status'].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{s.name}</td>
                <td className="py-3 px-4 text-gray-500">{s.code}</td>
                <td className="py-3 px-4">{s.total}</td>
                <td className="py-3 px-4 text-green-600 font-medium">{s.present}</td>
                <td className="py-3 px-4 text-red-500">{s.total - s.present}</td>
                <td className="py-3 px-4 font-bold" style={{ color: s.pct < 75 ? '#dc2626' : s.pct < 80 ? '#ea580c' : '#16a34a' }}>{s.pct}%</td>
                <td className="py-3 px-4">{s.pct >= 80 ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle size={13} /> Good</span> : <span className="flex items-center gap-1 text-orange-600 text-xs"><AlertCircle size={13} /> Low</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
