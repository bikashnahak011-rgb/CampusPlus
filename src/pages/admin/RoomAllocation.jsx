import { useEffect, useMemo, useState } from 'react'
import { BedDouble, Building2, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { EmptyState } from '../../components/ui/States'
import { DEMO_HOSTEL_ROOMS, DEMO_STUDENTS_ADMIN } from '../../data/demoData'
import { supabase } from '../../lib/supabase'

function getRoom(student) {
  const assignedRoom = student.room_number || student.hostel?.split('-').slice(1).join('-')
  const block = student.hostel_block || student.hostel?.split('-')[0]
  if (!assignedRoom || !block || /^unassigned$/i.test(assignedRoom) || student.hostel === 'Day Scholar') return null
  return { block: String(block).trim().toLowerCase(), room: String(assignedRoom).trim().toLowerCase() }
}

function normalizeRoomInventory(hostels) {
  return (hostels || []).flatMap(hostel => (hostel.rooms || []).map(room => ({
    id: room.id,
    block: hostel.block,
    room: room.room_number,
    floor: room.floor,
    capacity: room.capacity,
  })))
}

export default function AdminRoomAllocation() {
  const { user } = useAuth()
  const userId = user?.id
  const isDemo = Boolean(user?.isDemo)
  const [roomData, setRoomData] = useState(() => ({
    userId,
    rooms: isDemo ? DEMO_HOSTEL_ROOMS : [],
    students: isDemo ? DEMO_STUDENTS_ADMIN : [],
    loading: Boolean(userId && !isDemo && supabase),
    error: userId && !isDemo && !supabase ? 'Live hostel room records are unavailable because Supabase is not configured.' : '',
  }))

  useEffect(() => {
    if (!userId || isDemo || !supabase) return undefined

    let active = true
    Promise.all([
      supabase.from('hostels').select('id,block,rooms(id,room_number,floor,capacity)').order('block'),
      supabase.from('profiles').select('id,name,roll_no,department,hostel_block,room_number').eq('role', 'student').order('name'),
    ]).then(([hostelResult, studentResult]) => {
      if (!active) return
      if (hostelResult.error || studentResult.error) {
        setRoomData({
          userId,
          rooms: [],
          students: [],
          loading: false,
          error: `Could not load hostel occupancy: ${hostelResult.error?.message || studentResult.error?.message}`,
        })
      } else {
        setRoomData({
          userId,
          rooms: normalizeRoomInventory(hostelResult.data),
          students: studentResult.data || [],
          loading: false,
          error: '',
        })
      }
    }).catch(queryError => {
      if (!active) return
      setRoomData({
        userId,
        rooms: [],
        students: [],
        loading: false,
        error: `Could not load hostel room inventory: ${queryError.message || 'Unexpected database error.'}`,
      })
    })

    return () => { active = false }
  }, [userId, isDemo])

  const currentRoomData = roomData.userId === userId
    ? roomData
    : {
      rooms: isDemo ? DEMO_HOSTEL_ROOMS : [],
      students: isDemo ? DEMO_STUDENTS_ADMIN : [],
      loading: Boolean(userId && !isDemo && supabase),
      error: userId && !isDemo && !supabase ? 'Live hostel room records are unavailable because Supabase is not configured.' : '',
    }
  const { rooms: roomInventory, students, loading, error } = currentRoomData

  const { rooms, unmatchedAssignments } = useMemo(() => {
    const occupantsByRoom = new Map()
    for (const student of students) {
      const allocation = getRoom(student)
      if (!allocation) continue
      const key = `${allocation.block}-${allocation.room}`
      occupantsByRoom.set(key, [...(occupantsByRoom.get(key) || []), student])
    }

    const knownKeys = new Set(roomInventory.map(room => `${String(room.block).trim().toLowerCase()}-${String(room.room).trim().toLowerCase()}`))
    const roomRows = roomInventory.map(room => {
      const key = `${String(room.block).trim().toLowerCase()}-${String(room.room).trim().toLowerCase()}`
      return { ...room, occupants: occupantsByRoom.get(key) || [] }
    }).sort((a, b) => String(a.block).localeCompare(String(b.block))
      || String(a.room).localeCompare(String(b.room), undefined, { numeric: true }))

    const unmatched = [...occupantsByRoom.entries()]
      .filter(([key]) => !knownKeys.has(key))
      .flatMap(([, assignedStudents]) => assignedStudents)

    return { rooms: roomRows, unmatchedAssignments: unmatched }
  }, [roomInventory, students])

  const vacantRooms = rooms.filter(room => room.occupants.length === 0)
  const occupiedRooms = rooms.filter(room => room.occupants.length > 0)

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Hostel Room Finder</h1>
        <p className="mt-1 text-sm text-gray-500">See which hostel rooms have students assigned and which rooms are empty.</p>
      </header>

      {user?.isDemo && <div className="rounded-xl border border-violet-100 bg-violet-50 p-3 text-sm text-violet-800">Sample room inventory for demonstration. Live accounts show rooms registered by the hostel.</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="card flex items-center gap-3">
          <span className="rounded-xl bg-blue-50 p-3 text-blue-700"><Users size={20} /></span>
          <div><p className="text-2xl font-bold text-gray-900">{students.filter(student => getRoom(student)).length}</p><p className="text-xs text-gray-500">Assigned residents</p></div>
        </article>
        <article className="card flex items-center gap-3">
          <span className="rounded-xl bg-orange-50 p-3 text-orange-700"><Building2 size={20} /></span>
          <div><p className="text-2xl font-bold text-gray-900">{occupiedRooms.length}</p><p className="text-xs text-gray-500">Rooms with residents</p></div>
        </article>
        <article className="card flex items-center gap-3">
          <span className="rounded-xl bg-green-50 p-3 text-green-700"><BedDouble size={20} /></span>
          <div><p className="text-2xl font-bold text-green-700">{vacantRooms.length}</p><p className="text-xs text-gray-500">Empty rooms</p></div>
        </article>
      </div>

      {unmatchedAssignments.length > 0 && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        {unmatchedAssignments.length} resident assignment{unmatchedAssignments.length === 1 ? '' : 's'} reference room{unmatchedAssignments.length === 1 ? '' : 's'} not found in the registered room inventory. These are not counted as empty.
      </div>}

      {loading && <div className="card text-sm text-gray-500">Loading registered hostel rooms...</div>}
      {!loading && !error && rooms.length === 0 && <div className="card"><EmptyState message="No hostel rooms have been registered, so vacancies cannot be confirmed." icon={Building2} /></div>}

      {!loading && !error && rooms.length > 0 && <>
        <section className="card">
          <div className="mb-4 flex items-center gap-2">
            <BedDouble size={19} className="text-green-700" />
            <div><h2 className="font-semibold text-gray-900">Empty rooms</h2><p className="text-xs text-gray-500">Registered rooms with no student assigned.</p></div>
          </div>
          {vacantRooms.length === 0 ? <p className="rounded-lg bg-gray-50 px-3 py-4 text-sm text-gray-500">No empty rooms in the registered inventory.</p> : (
            <div className="flex flex-wrap gap-2">
              {vacantRooms.map(room => <span key={room.id} className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-800">Block {room.block} · Room {room.room}</span>)}
            </div>
          )}
        </section>

        <div className="card overflow-x-auto">
          <h2 className="mb-3 font-semibold text-gray-900">All registered rooms</h2>
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>{['Block', 'Room', 'Floor', 'Capacity', 'Assigned students', 'Status'].map(label => <th key={label} className="px-3 py-3">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms.map(room => (
                <tr key={room.id}>
                  <td className="px-3 py-3 font-semibold text-gray-800">Block {room.block}</td>
                  <td className="px-3 py-3 text-gray-700">{room.room}</td>
                  <td className="px-3 py-3 text-gray-600">{room.floor ?? '—'}</td>
                  <td className="px-3 py-3 text-gray-600">{room.capacity ?? '—'}</td>
                  <td className="px-3 py-3 text-gray-700">{room.occupants.length ? room.occupants.map(student => student.name).join(', ') : 'None'}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${room.occupants.length ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>{room.occupants.length ? 'Occupied' : 'Empty'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>}
    </section>
  )
}
