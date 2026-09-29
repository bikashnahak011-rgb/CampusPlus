import { useState } from 'react'
import { Building2, Check, Edit3, FlaskConical, Library, MapPin, Plus, Save, UsersRound } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import CampusMap from '../../components/CampusMap'

const STATUS_OPTIONS = ['Available', 'In use', 'Maintenance', 'Closed']
const TYPE_ICONS = { Classroom: Building2, Lab: FlaskConical, Library, 'Faculty Chamber': UsersRound }

export default function AdminRoomFinder() {
  const { campusRooms, updateCampusRoom, addCampusRoom } = useApp()
  const toast = useToast()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [selectedId, setSelectedId] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newRoom, setNewRoom] = useState({ code: '', name: '', building: '', floor: '', capacity: '', type: 'Classroom', note: '' })

  const startEditing = room => { setEditingId(room.id); setDraft({ status: room.status, note: room.note }) }
  const saveRoom = async () => {
    setSaving(true)
    try {
      await updateCampusRoom(editingId, draft)
      setEditingId(null)
      setDraft(null)
      toast('Room availability saved.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAddRoom = async event => {
    event.preventDefault()
    setSaving(true)
    try {
      await addCampusRoom({
        ...newRoom,
        id: crypto.randomUUID(),
        code: newRoom.code.trim(),
        name: newRoom.name.trim(),
        building: newRoom.building.trim(),
        floor: newRoom.floor.trim(),
        capacity: Number(newRoom.capacity) || 0,
        status: 'Available',
      })
      setNewRoom({ code: '', name: '', building: '', floor: '', capacity: '', type: 'Classroom', note: '' })
      setShowAddForm(false)
      toast('Campus room added.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center"><MapPin size={24} /></div><div><h1 className="text-2xl font-bold text-gray-900">Room Directory</h1><p className="text-gray-500 text-sm mt-1">Update availability for classrooms and campus spaces</p></div></div><button type="button" onClick={() => setShowAddForm(true)} className="btn-primary sm:!w-auto"><Plus size={16} /> Add room</button></div>
    <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-800">Keep this directory updated so new students and faculty can find the right room without asking around.</div>
    <CampusMap rooms={campusRooms} selectedId={selectedId} onSelect={setSelectedId} />
    <div className="grid lg:grid-cols-2 gap-4">
      {campusRooms.length === 0 && <div className="card py-10 text-center text-sm text-gray-500">No campus rooms have been added yet.</div>}
      {campusRooms.map(room => {
        const Icon = TYPE_ICONS[room.type] || Building2
        return <section key={room.id} className={`card border transition-colors ${selectedId === room.id ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center"><Icon size={20} /></div><div><p className="text-xs font-bold text-cyan-700">{room.code}</p><h2 className="font-semibold text-gray-900">{room.name}</h2></div></div><span className="text-xs text-gray-500">{room.type}</span></div>
          <div className="mt-4 space-y-2 text-sm text-gray-500"><p className="flex items-center gap-2"><Building2 size={15} /> {room.building}, {room.floor}</p><p className="flex items-center gap-2"><UsersRound size={15} /> Capacity: {room.capacity}</p></div>
          {editingId === room.id ? <div className="mt-4 space-y-3"><label className="block text-xs font-medium text-gray-500">Live status<select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">{STATUS_OPTIONS.map(status => <option key={status}>{status}</option>)}</select></label><label className="block text-xs font-medium text-gray-500">What should visitors know?<input value={draft.note} onChange={event => setDraft({ ...draft, note: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" /></label><button onClick={saveRoom} disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Saving...' : <><Save size={16} /> Save status</>}</button></div> : <><div className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">{room.note}</div><button onClick={() => startEditing(room)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900"><Edit3 size={16} /> Update live status</button></>}
          {room.status === 'Available' && editingId !== room.id && <Check size={16} className="float-right mt-1 text-green-600" />}
        </section>
      })}
    </div>
    <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="Add campus room">
      <form onSubmit={handleAddRoom} className="space-y-3">
        {[
          ['code', 'Room code', 'CS-101'],
          ['name', 'Room name', 'Computer Science 101'],
          ['building', 'Building', 'Computer Science Block'],
          ['floor', 'Floor', '1'],
          ['capacity', 'Capacity', '60'],
        ].map(([field, label, placeholder]) => <label key={field} className="block text-sm font-medium text-gray-700">{label}<input required value={newRoom[field]} onChange={event => setNewRoom(previous => ({ ...previous, [field]: event.target.value }))} placeholder={placeholder} className="input mt-1" /></label>)}
        <label className="block text-sm font-medium text-gray-700">Room type<select value={newRoom.type} onChange={event => setNewRoom(previous => ({ ...previous, type: event.target.value }))} className="input mt-1">{['Classroom', 'Lab', 'Library', 'Faculty Chamber'].map(type => <option key={type}>{type}</option>)}</select></label>
        <label className="block text-sm font-medium text-gray-700">Visitor note<input value={newRoom.note} onChange={event => setNewRoom(previous => ({ ...previous, note: event.target.value }))} placeholder="Availability or directions" className="input mt-1" /></label>
        <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button><button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">{saving ? 'Saving...' : 'Add room'}</button></div>
      </form>
    </Modal>
  </div>
}