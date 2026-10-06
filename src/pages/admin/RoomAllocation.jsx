import { useMemo } from 'react'
import { Building2, Users } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { EmptyState } from '../../components/ui/States'

function getRoom(student) {
  const assignedRoom = student.room_number || student.hostel?.split('-').slice(1).join('-')
  const block = student.hostel_block || student.hostel?.split('-')[0]
  if (!assignedRoom || !block || student.hostel === 'Day Scholar') return null
  return { block, room: assignedRoom }
}

export default function AdminRoomAllocation() {
  const { students } = useApp()
  const residents = useMemo(() => students
    .map(student => ({ ...student, allocation: getRoom(student) }))
    .filter(student => student.allocation)
    .sort((a, b) => a.allocation.block.localeCompare(b.allocation.block)
      || a.allocation.room.localeCompare(b.allocation.room, undefined, { numeric: true })
      || a.name.localeCompare(b.name)), [students])

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Room Allocation</h1>
        <p className="mt-1 text-sm text-gray-500">Assigned hostel residents grouped by block and room.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="card flex items-center gap-3">
          <span className="rounded-xl bg-violet-50 p-3 text-violet-700"><Users size={20} /></span>
          <div><p className="text-2xl font-bold text-gray-900">{residents.length}</p><p className="text-xs text-gray-500">Residents with a room</p></div>
        </article>
        <article className="card flex items-center gap-3">
          <span className="rounded-xl bg-blue-50 p-3 text-blue-700"><Building2 size={20} /></span>
          <div><p className="text-2xl font-bold text-gray-900">{new Set(residents.map(student => `${student.allocation.block}-${student.allocation.room}`)).size}</p><p className="text-xs text-gray-500">Rooms in use</p></div>
        </article>
      </div>
      <div className="card overflow-x-auto">
        {residents.length === 0 ? <EmptyState message="No hostel room assignments are available." icon={Building2} /> : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>{['Block', 'Room', 'Student', 'Roll number', 'Department'].map(label => <th key={label} className="px-3 py-3">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {residents.map(student => (
                <tr key={student.id}>
                  <td className="px-3 py-3 font-semibold text-gray-800">Block {student.allocation.block}</td>
                  <td className="px-3 py-3 text-gray-700">{student.allocation.room}</td>
                  <td className="px-3 py-3 font-medium text-gray-900">{student.name}</td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-600">{student.roll || student.roll_no || '—'}</td>
                  <td className="px-3 py-3 text-gray-600">{student.dept || student.department || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
