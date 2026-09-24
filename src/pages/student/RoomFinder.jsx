import { useMemo, useState } from 'react'
import { BookOpen, Building2, CheckCircle2, FlaskConical, GraduationCap, Library, MapPin, Radio, Search, UsersRound } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import CampusMap from '../../components/CampusMap'

const TYPES = ['All types', 'Classroom', 'Lab', 'Library', 'Faculty Chamber']
const TYPE_ICONS = { Classroom: GraduationCap, Lab: FlaskConical, Library, 'Faculty Chamber': UsersRound }

export default function RoomFinder() {
  const { campusRooms } = useApp()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All types')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  const filteredRooms = useMemo(() => campusRooms.filter(room => {
    const matchesQuery = `${room.code} ${room.name} ${room.building} ${room.note}`.toLowerCase().includes(query.toLowerCase())
    const matchesType = type === 'All types' || room.type === type
    const matchesAvailability = !onlyAvailable || room.status === 'Available'
    return matchesQuery && matchesType && matchesAvailability
  }), [campusRooms, query, type, onlyAvailable])

  const availableCount = campusRooms.filter(room => room.status === 'Available').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center"><MapPin size={24} /></div>
          <div><h1 className="text-2xl font-bold text-gray-900">Live Room Finder</h1><p className="text-gray-500 text-sm mt-1">Find classrooms, labs, library and faculty chambers</p></div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"><Radio size={14} className="animate-pulse" /> Live campus status</div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="card border-cyan-100"><p className="text-xs text-gray-500">Spaces tracked</p><p className="text-2xl font-bold text-gray-900 mt-1">{campusRooms.length}</p></div>
        <div className="card border-green-100"><p className="text-xs text-gray-500">Available now</p><p className="text-2xl font-bold text-green-600 mt-1">{availableCount}</p></div>
        <div className="card border-orange-100"><p className="text-xs text-gray-500">Last updated</p><p className="text-sm font-semibold text-gray-900 mt-2">Just now</p></div>
      </div>

      <div className="card space-y-3">
        <div className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search room code, library, lab or faculty name..." className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" /></div>
        <div className="flex flex-wrap items-center gap-2">
          {TYPES.map(option => <button key={option} onClick={() => setType(option)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${type === option ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-cyan-50 hover:text-cyan-700'}`}>{option}</button>)}
          <button onClick={() => setOnlyAvailable(!onlyAvailable)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${onlyAvailable ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{onlyAvailable ? 'Showing available' : 'Only available'}</button>
        </div>
      </div>

      <CampusMap rooms={campusRooms} selectedId={selectedId} onSelect={setSelectedId} />

      <div className="grid lg:grid-cols-2 gap-4">
        {filteredRooms.map(room => {
          const Icon = TYPE_ICONS[room.type] || Building2
          const isAvailable = room.status === 'Available'
          return <article key={room.id} className={`card border transition-colors ${selectedId === room.id ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-gray-200 hover:border-cyan-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3"><div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}><Icon size={22} /></div><div><p className="text-xs font-bold text-cyan-700">{room.code}</p><h2 className="font-semibold text-gray-900">{room.name}</h2></div></div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{room.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500"><p className="flex items-center gap-1.5"><Building2 size={14} /> {room.building}</p><p className="flex items-center gap-1.5"><MapPin size={14} /> {room.floor}</p><p className="flex items-center gap-1.5"><UsersRound size={14} /> Up to {room.capacity}</p><p className="flex items-center gap-1.5"><BookOpen size={14} /> {room.type}</p></div>
            <div className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${isAvailable ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}><CheckCircle2 size={14} /> {room.note}</div>
          </article>
        })}
      </div>
      {filteredRooms.length === 0 && <div className="card text-center py-10 text-sm text-gray-500">No rooms match your search.</div>}
    </div>
  )
}