import { useState } from 'react'
import { Search, Users } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { StatusBadge } from '../../components/ui/States'

export default function AdminStudents() {
  const { students } = useApp()
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')

  const depts = ['All', ...new Set(students.map(s => s.dept))]
  const filtered = students.filter(s => {
    const ms = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase())
    const md = deptFilter === 'All' || s.dept === deptFilter
    return ms && md
  })

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Students</h1><p className="text-gray-500 text-sm mt-1">{students.length} registered students</p></div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or roll number..." className="input pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {depts.map(d => (
              <button key={d} onClick={() => setDeptFilter(d)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${deptFilter === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12"><Users size={32} className="text-gray-300 mx-auto mb-2" /><p className="text-gray-400">No students found</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">{['Name', 'Roll No', 'Department', 'Year', 'Hostel', 'Status'].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">{s.name[0]}</div>
                      <span className="font-medium text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">{s.roll}</td>
                  <td className="py-3 px-4 text-gray-700">{s.dept}</td>
                  <td className="py-3 px-4 text-gray-500">Year {s.year}</td>
                  <td className="py-3 px-4 text-gray-500">{s.hostel}</td>
                  <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
