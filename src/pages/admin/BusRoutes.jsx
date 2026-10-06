import { useEffect, useRef, useState } from 'react'
import { BusFront, Check, Clock3, LocateFixed, MapPin, Plus, Radio, Save, Square, TriangleAlert } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { supabase } from '../../lib/supabase'

function BusGpsControl({ busId, user }) {
  const [sharing, setSharing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const watchId = useRef(null)
  const lastUploadAt = useRef(0)

  const clearGpsWatch = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }

  useEffect(() => () => clearGpsWatch(), [])

  const startSharing = () => {
    if (!navigator.geolocation) {
      setMessage('This device does not support GPS location.')
      return
    }
    if (!window.isSecureContext) {
      setMessage('GPS requires a secure connection. Open this site over HTTPS or localhost.')
      return
    }

    setBusy(true)
    setMessage('Waiting for GPS permission and a location fix...')
    watchId.current = navigator.geolocation.watchPosition(async position => {
      const now = Date.now()
      if (now - lastUploadAt.current < 5000) return
      lastUploadAt.current = now

      const { error } = await supabase.from('bus_locations').upsert({
        bus_id: busId,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy_m: position.coords.accuracy,
        is_sharing: true,
        updated_at: new Date(now).toISOString(),
      }, { onConflict: 'bus_id' })

      setBusy(false)
      if (error) {
        setMessage(`Could not publish GPS: ${error.message}`)
        return
      }
      setSharing(true)
      setMessage('GPS sharing is active. Keep this page open while the bus is moving.')
    }, error => {
      setBusy(false)
      if (error.code === 1) {
        clearGpsWatch()
        setSharing(false)
        setMessage('Location permission was denied. Allow location access in your browser and try again.')
      } else if (error.code === 2) {
        setMessage('GPS signal unavailable. Check device location settings; still waiting for a fix...')
      } else if (error.code === 3) {
        setMessage('GPS is taking longer than expected; still waiting for a fix...')
      } else {
        setMessage(`Unable to get a GPS fix${error.message ? `: ${error.message}` : '.'}`)
      }
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 })
  }

  const stopSharing = async () => {
    clearGpsWatch()
    setBusy(true)
    const { error } = await supabase
      .from('bus_locations')
      .update({ is_sharing: false })
      .eq('bus_id', busId)
    setBusy(false)
    setSharing(false)
    setMessage(error ? `GPS stopped on this device, but the server could not be updated: ${error.message}` : 'GPS sharing stopped.')
  }

  if (user?.isDemo || user?.role !== 'admin' || !supabase) {
    return <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">GPS sharing requires a signed-in admin account with Supabase configured.</p>
  }

  return (
    <div className="mt-5 border-t border-gray-100 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={sharing ? stopSharing : startSharing}
          disabled={busy}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${sharing ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-violet-700 text-white hover:bg-violet-800'}`}
        >
          {sharing ? <Square size={16} /> : <LocateFixed size={16} />}
          {busy ? 'Connecting GPS...' : sharing ? 'Stop GPS sharing' : 'Start GPS sharing'}
        </button>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${sharing ? 'text-green-700' : 'text-gray-500'}`}>
          <Radio size={14} /> {sharing ? 'Transmitting location' : 'GPS inactive'}
        </span>
      </div>
      <p className="mt-2 text-xs text-gray-500">Use the driver&apos;s device and allow location access. Updates are sent every 5 seconds while this page stays open.</p>
      {message && <p role="status" className="mt-2 text-xs text-gray-600">{message}</p>}
    </div>
  )
}

export default function AdminBusRoutes() {
  const { busRoutes, updateBusRoute, addBusRoute } = useApp()
  const { user } = useAuth()
  const toast = useToast()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newRoute, setNewRoute] = useState({ number: '', name: '', stops: '', departure: '', arrival: '', frequency: '' })

  const startEditing = (route) => {
    setEditingId(route.id)
    setDraft({ ...route, stops: route.stops.join(' -> ') })
  }

  const saveRoute = async () => {
    setSaving(true)
    try {
      await updateBusRoute(editingId, {
        ...draft,
        stops: draft.stops.split('->').map(stop => stop.trim()).filter(Boolean),
      })
      setEditingId(null)
      setDraft(null)
      toast('Bus route saved.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (route, unavailable) => {
    try {
      await updateBusRoute(route.id, {
        status: unavailable ? 'Bus not coming' : 'Running today',
        notice: unavailable ? 'This bus is not coming today. Please use another route or contact transport support.' : '',
      })
      toast('Bus status updated.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    }
  }

  const handleAddRoute = async event => {
    event.preventDefault()
    setSaving(true)
    try {
      await addBusRoute({
        id: crypto.randomUUID(),
        ...newRoute,
        number: newRoute.number.trim(),
        name: newRoute.name.trim(),
        stops: newRoute.stops.split('->').map(stop => stop.trim()).filter(Boolean),
        departure: newRoute.departure.trim() || 'Not scheduled',
        arrival: newRoute.arrival.trim() || 'Not scheduled',
        frequency: newRoute.frequency.trim() || 'See timetable',
        status: 'Running today',
        notice: '',
      })
      setNewRoute({ number: '', name: '', stops: '', departure: '', arrival: '', frequency: '' })
      setShowAddForm(false)
      toast('Bus route added.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><BusFront size={24} /></div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Bus Routes</h1>
            <p className="text-gray-500 text-sm mt-1">Manage campus transport routes and availability</p>
          </div>
        </div>
        <button type="button" onClick={() => setShowAddForm(true)} className="btn-primary sm:!w-auto"><Plus size={16} /> Add route</button>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
        Changes are visible to students immediately. Mark a bus unavailable when it is not coming today.
      </div>

      {busRoutes.length === 0 && <div className="card py-10 text-center text-sm text-gray-500">No bus routes have been added yet. Add the campus routes here to publish them for students.</div>}
      {busRoutes.map(route => (
        <section key={route.id} className="card min-w-0 border border-gray-200">
          {editingId === route.id ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-gray-900">Edit Bus {route.number}</h2>
                <button onClick={() => { setEditingId(null); setDraft(null) }} className="text-sm text-gray-500 hover:text-gray-900">Cancel</button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <button onClick={saveRoute} disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Saving...' : <><Save size={16} /> Save route</>}</button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">{route.number}</div>
                  <div className="min-w-0"><p className="text-xs text-gray-400 uppercase tracking-wide">Bus number</p><h2 className="break-words text-base font-bold text-gray-900 sm:text-lg">{route.name}</h2></div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${route.status === 'Bus not coming' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {route.status === 'Bus not coming' ? <TriangleAlert size={14} /> : <Check size={14} />} {route.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bus-route-summary bus-route-summary--stops min-w-0"><MapPin size={16} /><p className="text-xs text-gray-400">Stops</p><p className="break-words text-sm font-semibold text-gray-900">{route.stops.join(' -> ')}</p></div>
                <div className="bus-route-summary bus-route-summary--departure"><Clock3 size={16} /><p className="text-xs text-gray-400">Departure</p><p className="text-sm font-semibold text-gray-900">{route.departure}</p></div>
                <div className="bus-route-summary bus-route-summary--arrival"><Clock3 size={16} /><p className="text-xs text-gray-400">Arrival</p><p className="text-sm font-semibold text-gray-900">{route.arrival}</p></div>
                <div className="bus-route-summary bus-route-summary--frequency"><BusFront size={16} /><p className="text-xs text-gray-400">Frequency</p><p className="text-sm font-semibold text-gray-900">{route.frequency}</p></div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 sm:mt-6 sm:flex sm:flex-wrap">
                <button onClick={() => startEditing(route)} className="btn-primary sm:!w-auto"><Save size={16} /> Edit route</button>
                <button onClick={() => setStatus(route, route.status !== 'Bus not coming')} className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors sm:w-auto ${route.status === 'Bus not coming' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                  <TriangleAlert size={16} /> {route.status === 'Bus not coming' ? 'Mark bus running' : 'Bus not coming'}
                </button>
              </div>
              <BusGpsControl busId={route.id} user={user} />
            </>
          )}
        </section>
      ))}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="Add bus route">
        <form onSubmit={handleAddRoute} className="space-y-3">
          {[
            ['number', 'Bus number', 'e.g. BUS-01'],
            ['name', 'Route name', 'e.g. Main Gate to Academic Block'],
            ['stops', 'Stops, separated by ->', 'Main Gate -> Library -> Campus'],
            ['departure', 'First departure', '07:30 AM'],
            ['arrival', 'Campus arrival', '08:15 AM'],
            ['frequency', 'Service frequency', 'Every 30 minutes'],
          ].map(([field, label, placeholder]) => (
            <label key={field} className="block text-sm font-medium text-gray-700">
              {label}
              <input required={['number', 'name', 'stops'].includes(field)} value={newRoute[field]} onChange={event => setNewRoute(previous => ({ ...previous, [field]: event.target.value }))} placeholder={placeholder} className="input mt-1" />
            </label>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">{saving ? 'Saving...' : 'Add route'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
