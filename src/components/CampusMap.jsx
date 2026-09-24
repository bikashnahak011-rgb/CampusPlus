import { ArrowUp, BookOpen, Building2, FlaskConical, GraduationCap, Library, MapPin, UsersRound } from 'lucide-react'

const MAP_ITEMS = [
  { id: 'room-cs101', label: 'CS Block', detail: 'CS-101 / CS-102', left: '29%', top: '25%', type: 'Classroom' },
  { id: 'room-cs-lab1', label: 'Labs', detail: 'CS-Lab1 / CS-Lab2', left: '52%', top: '25%', type: 'Lab' },
  { id: 'room-lib', label: 'Library', detail: 'LIB-01', left: '75%', top: '25%', type: 'Library' },
  { id: 'room-faculty', label: 'Faculty', detail: 'FC-02', left: '52%', top: '66%', type: 'Faculty Chamber' },
]

const ICONS = { Classroom: GraduationCap, Lab: FlaskConical, Library, 'Faculty Chamber': UsersRound }

export default function CampusMap({ rooms, selectedId, onSelect }) {
  return (
    <section className="card border border-cyan-100 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div><h2 className="font-semibold text-gray-900">Campus direction map</h2><p className="text-xs text-gray-500 mt-1">North is up. Select a building to find its rooms.</p></div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-700"><ArrowUp size={15} /> North</div>
      </div>
      <div className="relative aspect-[16/8] min-h-[250px] overflow-hidden rounded-2xl border border-cyan-100 bg-cyan-50/70" style={{ backgroundImage: 'linear-gradient(rgba(8,145,178,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(8,145,178,0.08) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        <div className="absolute left-[8%] right-[8%] top-[51%] h-3 rounded-full bg-amber-200/80 rotate-[-4deg]" />
        <div className="absolute left-[20%] top-[30%] h-[45%] w-2 rounded-full bg-amber-200/80 rotate-[18deg]" />
        <div className="absolute left-[4%] bottom-[8%] flex items-center gap-1 rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-gray-600 shadow-sm"><MapPin size={13} className="text-red-500" /> Main Gate</div>
        <div className="absolute right-[4%] bottom-[8%] flex items-center gap-1 rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-gray-600 shadow-sm"><MapPin size={13} className="text-green-600" /> Hostel</div>
        {MAP_ITEMS.map(item => {
          const Icon = ICONS[item.type] || Building2
          const room = rooms.find(candidate => candidate.id === item.id)
          const selected = selectedId === item.id
          return <button key={item.id} onClick={() => onSelect(item.id)} style={{ left: item.left, top: item.top }} className={`absolute -translate-x-1/2 -translate-y-1/2 w-[27%] min-w-[105px] rounded-xl border-2 p-2 text-left shadow-sm transition-all ${selected ? 'z-10 border-cyan-600 bg-cyan-600 text-white scale-105 shadow-lg' : 'border-white bg-white text-gray-800 hover:border-cyan-400'}`}>
            <div className="flex items-center gap-2"><Icon size={16} className={selected ? 'text-cyan-100' : 'text-cyan-600'} /><span className="text-xs font-bold truncate">{item.label}</span></div>
            <p className={`text-[10px] mt-1 truncate ${selected ? 'text-cyan-100' : 'text-gray-500'}`}>{item.detail}</p>
            <span className={`mt-1 inline-block text-[9px] font-semibold ${selected ? 'text-white' : room?.status === 'Available' ? 'text-green-600' : 'text-orange-600'}`}>{room?.status || 'Live status'}</span>
          </button>
        })}
        <div className="absolute left-[42%] top-[49%] text-[10px] font-bold uppercase tracking-widest text-cyan-700/60">Central Walkway</div>
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Available</span><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> In use</span><span className="flex items-center gap-1.5"><BookOpen size={13} /> Walkway connects all blocks</span></div>
    </section>
  )
}