import { useState } from 'react'
import { ArrowUp, BookOpen, Building2, FlaskConical, GraduationCap, Library, MapPin, UsersRound } from 'lucide-react'

const FLOOR_ROOMS = Array.from({ length: 3 }, (_, floorIndex) => {
  const floor = floorIndex + 1
  return [
    ...Array.from({ length: 4 }, (_, index) => ({ type: 'Classroom', code: `C${floor}0${index + 1}`, name: `Classroom ${index + 1}` })),
    ...Array.from({ length: 2 }, (_, index) => ({ type: 'Lab', code: `L${floor}0${index + 1}`, name: `Lab ${index + 1}` })),
    ...Array.from({ length: 3 }, (_, index) => ({ type: 'Faculty Chamber', code: `F${floor}0${index + 1}`, name: `Faculty room ${index + 1}` })),
    { type: 'Library', code: `LIB-${floor}`, name: 'Library' },
  ]
})

const ROOM_STYLES = {
  Classroom: { Icon: GraduationCap, color: 'border-sky-200 bg-sky-50 text-sky-800' },
  Lab: { Icon: FlaskConical, color: 'border-violet-200 bg-violet-50 text-violet-800' },
  'Faculty Chamber': { Icon: UsersRound, color: 'border-rose-200 bg-rose-50 text-rose-800' },
  Library: { Icon: Library, color: 'border-teal-200 bg-teal-50 text-teal-800' },
}

export default function CampusMap() {
  const [selectedFloor, setSelectedFloor] = useState(0)

  return (
    <section className="card border border-violet-100 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div><h2 className="font-semibold text-gray-900">Campus direction map</h2><p className="text-xs text-gray-500 mt-1">North is up. Select a building to find its rooms.</p></div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700"><ArrowUp size={15} /> North</div>
      </div>
      <div className="relative min-h-[740px] overflow-hidden rounded-2xl border border-violet-100 bg-violet-50/70 sm:min-h-[420px]" style={{ backgroundImage: 'linear-gradient(rgba(121,100,197,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(121,100,197,0.075) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        <div className="absolute left-[5%] right-[5%] top-[51%] h-3 rounded-full bg-indigo-200/90 rotate-[-4deg]" />
        <div className="absolute left-[17%] top-[30%] h-[45%] w-2 rounded-full bg-indigo-200/90 rotate-[18deg]" />
        <div className="absolute left-[4%] bottom-[4%] z-10 flex items-center gap-1 rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-gray-600 shadow-sm"><MapPin size={13} className="text-red-500" /> Main Gate</div>
        <div className="absolute right-[4%] bottom-[4%] z-10 flex items-center gap-1 rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-gray-600 shadow-sm"><MapPin size={13} className="text-green-600" /> Hostel</div>
        <div className="relative z-10 grid gap-3 p-3 pb-14 sm:p-4 sm:pb-14 xl:grid-cols-[minmax(180px,0.65fr)_minmax(0,2fr)] xl:items-start">
          <div className="rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg">
            <h3 className="font-semibold text-gray-900">Campus overview</h3>
            <p className="mt-1 text-xs text-gray-500">Computer Science Block location</p>
            <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-lg border border-violet-100 bg-violet-50/70" style={{ backgroundImage: 'linear-gradient(rgba(121,100,197,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(121,100,197,0.09) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              <div className="absolute left-[8%] right-[8%] top-[52%] h-2 rounded-full bg-indigo-200/90 rotate-[-5deg]" />
              <div className="absolute left-[30%] top-[22%] h-[57%] w-1.5 rounded-full bg-indigo-200/90 rotate-[18deg]" />
              <div className="absolute left-1/2 top-[24%] -translate-x-1/2 rounded-md border border-violet-200 bg-white px-2 py-1.5 text-center text-[10px] font-bold text-violet-800 shadow-sm">
                <Building2 size={14} className="mx-auto mb-0.5 text-violet-700" />CS Block
              </div>
              <div className="absolute left-[4%] bottom-[5%] flex items-center gap-1 rounded bg-white px-1.5 py-1 text-[9px] font-bold text-gray-600 shadow-sm"><MapPin size={11} className="text-red-500" /> Gate</div>
              <div className="absolute right-[4%] bottom-[5%] flex items-center gap-1 rounded bg-white px-1.5 py-1 text-[9px] font-bold text-gray-600 shadow-sm"><MapPin size={11} className="text-green-600" /> Hostel</div>
              <span className="absolute left-[43%] top-[54%] -translate-y-1/2 rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-violet-800 shadow-sm">Walkway</span>
            </div>
          </div>
          <div className="rounded-xl border border-white bg-white/95 p-3 shadow-lg sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-900">Computer Science Block</h3>
            <p className="mt-1 text-xs text-gray-500">Floor plan · 4 classrooms · 2 labs · 3 faculty rooms · 1 library</p>
          </div>
          <div className="flex rounded-lg border border-gray-200 p-1" aria-label="Select floor">
            {FLOOR_ROOMS.map((_, floorIndex) => <button
              key={floorIndex}
              type="button"
              onClick={() => setSelectedFloor(floorIndex)}
              aria-pressed={selectedFloor === floorIndex}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${selectedFloor === floorIndex ? 'bg-violet-700 text-white' : 'text-gray-600 hover:bg-violet-50'}`}
            >Floor {floorIndex + 1}</button>)}
          </div>
        </div>
          <div className="mt-4 rounded-lg border-2 border-gray-300 bg-gray-50 p-2 sm:p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-5">
            {FLOOR_ROOMS[selectedFloor].slice(0, 5).map(room => {
              const { Icon, color } = ROOM_STYLES[room.type]
              return <div key={room.code} className={`flex min-h-16 items-center gap-2 rounded-md border p-2 ${color}`}>
                <Icon size={16} className="shrink-0" />
                <div className="min-w-0"><p className="truncate text-xs font-bold">{room.name}</p><p className="text-[10px] opacity-75">{room.code}</p></div>
              </div>
            })}
          </div>
          <div className="my-2 flex h-8 items-center justify-center border-y border-dashed border-gray-300 bg-white text-[10px] font-bold uppercase tracking-wider text-gray-500">Central hallway</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-5">
            {FLOOR_ROOMS[selectedFloor].slice(5).map(room => {
              const { Icon, color } = ROOM_STYLES[room.type]
              return <div key={room.code} className={`flex min-h-16 items-center gap-2 rounded-md border p-2 ${color}`}>
                <Icon size={16} className="shrink-0" />
                <div className="min-w-0"><p className="truncate text-xs font-bold">{room.name}</p><p className="text-[10px] opacity-75">{room.code}</p></div>
              </div>
            })}
          </div>
        </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
            {Object.entries(ROOM_STYLES).map(([type, { Icon, color }]) => <span key={type} className="flex items-center gap-1.5"><Icon size={14} className={color.split(' ').at(-1)} />{type === 'Faculty Chamber' ? 'Faculty room' : type}</span>)}
          </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Available</span><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> In use</span><span className="flex items-center gap-1.5"><BookOpen size={13} /> Walkway connects all blocks</span></div>
    </section>
  )
}
