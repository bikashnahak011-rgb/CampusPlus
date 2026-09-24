import { useState } from 'react'
import { BusFront, Check, Clock3, MapPin, Save, TriangleAlert } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'

export default function AdminBusRoutes() {
  const { busRoutes, updateBusRoute } = useApp()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)

  const startEditing = (route) => {
    setEditingId(route.id)
    setDraft({ ...route, stops: route.stops.join(' -> ') })
  }

  const saveRoute = () => {
    updateBusRoute(editingId, {
      ...draft,
      stops: draft.stops.split('->').map(stop => stop.trim()).filter(Boolean),
    })
    setEditingId(null)
    setDraft(null)
  }

  const setStatus = (route, unavailable) => {
    updateBusRoute(route.id, {
      status: unavailable ? 'Bus not coming' : 'Running today',
      notice: unavailable ? 'This bus is not coming today. Please use another route or contact transport support.' : '',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center"><BusFront size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bus Routes</h1>
            <p className="text-gray-500 text-sm mt-1">Manage campus transport routes and availability</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
        Changes are visible to students immediately. Mark a bus unavailable when it is not coming today.
      </div>

      {busRoutes.map(route => (
        <section key={route.id} className="card border border-gray-200">
          {editingId === route.id ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Edit Bus {route.number}</h2>
                <button onClick={() => { setEditingId(null); setDraft(null) }} className="text-sm text-gray-500 hover:text-gray-900">Cancel</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ['name', 'Route name'],
                  ['stops', 'Stops (use -> between stops)'],
                  ['departure', 'First departure'],
                  ['arrival', 'Campus arrival'],
                  ['frequency', 'Frequency'],
                ].map(([field, label]) => (
                  <label key={field} className={field === 'stops' ? 'sm:col-span-2' : ''}>
                    <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
                    <input value={draft[field]} onChange={event => setDraft({ ...draft, [field]: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </label>
                ))}
              </div>
              <button onClick={saveRoute} className="btn-primary"><Save size={16} /> Save route</button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">{route.number}</div>
                  <div><p className="text-xs text-gray-400 uppercase tracking-wide">Bus number</p><h2 className="text-lg font-bold text-gray-900">{route.name}</h2></div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${route.status === 'Bus not coming' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {route.status === 'Bus not coming' ? <TriangleAlert size={14} /> : <Check size={14} />} {route.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="rounded-xl bg-gray-50 p-3"><MapPin size={16} className="text-orange-600 mb-2" /><p className="text-xs text-gray-400">Stops</p><p className="text-sm font-semibold text-gray-900">{route.stops.join(' -> ')}</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><Clock3 size={16} className="text-orange-600 mb-2" /><p className="text-xs text-gray-400">Departure</p><p className="text-sm font-semibold text-gray-900">{route.departure}</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><Clock3 size={16} className="text-orange-600 mb-2" /><p className="text-xs text-gray-400">Arrival</p><p className="text-sm font-semibold text-gray-900">{route.arrival}</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><BusFront size={16} className="text-orange-600 mb-2" /><p className="text-xs text-gray-400">Frequency</p><p className="text-sm font-semibold text-gray-900">{route.frequency}</p></div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                <button onClick={() => startEditing(route)} className="btn-primary"><Save size={16} /> Edit route</button>
                <button onClick={() => setStatus(route, route.status !== 'Bus not coming')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${route.status === 'Bus not coming' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                  <TriangleAlert size={16} /> {route.status === 'Bus not coming' ? 'Mark bus running' : 'Bus not coming'}
                </button>
              </div>
            </>
          )}
        </section>
      ))}
    </div>
  )
}