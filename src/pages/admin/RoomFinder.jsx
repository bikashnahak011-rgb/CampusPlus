import { useState } from 'react'
import { Building2, Check, Edit3, FlaskConical, Library, MapPin, Save, UsersRound } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import CampusMap from '../../components/CampusMap'

const STATUS_OPTIONS = ['Available', 'In use', 'Maintenance', 'Closed']
const TYPE_ICONS = { Classroom: Building2, Lab: FlaskConical, Library, 'Faculty Chamber': UsersRound }

export default function AdminRoomFinder() {
  const { campusRooms, updateCampusRoom } = useApp()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [selectedId, setSelectedId] = useState('')

  const startEditing = room => { setEditingId(room.id); setDraft({ status: room.status, note: room.note }) }
  const saveRoom = () => { updateCampusRoom(editingId, draft); setEditingId(null); setDraft(null) }

  return <div className="space-y-6">
    <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center"><MapPin size={24} /></div><div><h1 className="text-2xl font-bold text-gray-900">Room Directory</h1><p className="text-gray-500 text-sm mt-1">Update live availability for classrooms and campus spaces</p></div></div>
    <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-800">Keep this directory updated so new students and faculty can find the right room without asking around.</div>
    <CampusMap rooms={campusRooms} selectedId={selectedId} onSelect={setSelectedId} />
    <div className="grid lg:grid-cols-2 gap-4">
      {campusRooms.map(room => {
        const Icon = TYPE_ICONS[room.type] || Building2
        return <section key={room.id} className={`card border transition-colors ${selectedId === room.id ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center"><Icon size={20} /></div><div><p className="text-xs font-bold text-cyan-700">{room.code}</p><h2 className="font-semibold text-gray-900">{room.name}</h2></div></div><span className="text-xs text-gray-500">{room.type}</span></div>
          <div className="mt-4 space-y-2 text-sm text-gray-500"><p className="flex items-center gap-2"><Building2 size={15} /> {room.building}, {room.floor}</p><p className="flex items-center gap-2"><UsersRound size={15} /> Capacity: {room.capacity}</p></div>
          {editingId === room.id ? <div className="mt-4 space-y-3"><label className="block text-xs font-medium text-gray-500">Live status<select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option>{STATUS_OPTIONS[0]}</option>{STATUS_OPTIONS.slice(1).map(status => <option key={status}>{status}</option>)}</select></label><label className="block text-xs font-medium text-gray-500">What should visitors know?<input value={draft.note} onChange={event => setDraft({ ...draft, note: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" /></label><button onClick={saveRoom} className="btn-primary"><Save size={16} /> Save status</button></div> : <><div className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">{room.note}</div><button onClick={() => startEditing(room)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900"><Edit3 size={16} /> Update live status</button></>}
          {room.status === 'Available' && editingId !== room.id && <Check size={16} className="float-right mt-1 text-green-600" />}
        </section>
      })}
    </div>
  </div>
}