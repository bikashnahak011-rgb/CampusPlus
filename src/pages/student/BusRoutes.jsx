import { useEffect, useState } from 'react'
import { ArrowUpRight, BusFront, Clock3, MapPin, Navigation, Radio, Route, ShieldCheck } from 'lucide-react'
import { BusTrackerMap } from '../../components/BusTrackerMap'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function BusRoutesPage() {
  const { busRoutes } = useApp()
  const { user } = useAuth()
  const [selectedBusId, setSelectedBusId] = useState(busRoutes[0]?.id || '')
  const [locations, setLocations] = useState({})
  const [gpsError, setGpsError] = useState('')
  const [now, setNow] = useState(0)
  const selectedRoute = busRoutes.find(route => route.id === selectedBusId)
  const selectedLocation = locations[selectedBusId]
  const locationAge = selectedLocation ? now - new Date(selectedLocation.updated_at).getTime() : Infinity
  const isLive = Boolean(selectedLocation?.is_sharing && locationAge >= 0 && locationAge < 30000)
  const gpsNotice = user?.isDemo
    ? 'Live GPS is not connected in demo mode.'
    : !supabase
      ? 'Live GPS is unavailable because Supabase is not configured.'
    : gpsError

  useEffect(() => {
    if (busRoutes.length && !busRoutes.some(route => route.id === selectedBusId)) {
      setSelectedBusId(busRoutes[0].id)
    }
  }, [busRoutes, selectedBusId])

  useEffect(() => {
    if (!supabase || !user || user.isDemo) return undefined

    let active = true
    const busIds = busRoutes.map(route => route.id)

    const loadLocations = async () => {
      if (busIds.length === 0) {
        setLocations({})
        return
      }
      const { data, error } = await supabase.from('bus_locations').select('*').in('bus_id', busIds)
      if (!active) return
      if (error) {
        setGpsError('Live GPS is not configured. Ask an administrator to finish the bus tracking setup.')
        return
      }
      setLocations(Object.fromEntries((data || []).map(location => [location.bus_id, location])))
      setGpsError('')
    }

    loadLocations()

    const channel = supabase
      .channel('student-bus-locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bus_locations' }, payload => {
        if (!active) return
        if (payload.eventType === 'DELETE') {
          setLocations(previous => {
            const next = { ...previous }
            delete next[payload.old.bus_id]
            return next
          })
        } else if (payload.new?.bus_id) {
          setLocations(previous => ({ ...previous, [payload.new.bus_id]: payload.new }))
          setGpsError('')
        }
      })
      .subscribe(status => {
        if (active && status === 'CHANNEL_ERROR') setGpsError('Live GPS connection was interrupted.')
      })
    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadLocations()
    }, 5000)

    return () => {
      active = false
      window.clearInterval(refreshInterval)
      supabase.removeChannel(channel)
    }
  }, [busRoutes, user])

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 5000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <BusFront size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Bus Routes</h1>
            <p className="text-gray-500 text-sm mt-1">Campus transport timings and stops</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white shadow-lg shadow-orange-200/60 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-100">Today&apos;s transport</p>
            <h2 className="text-xl font-bold mt-1">Plan your campus trip</h2>
            <p className="text-sm text-amber-50 mt-1">Check the next departure before leaving your stop.</p>
          </div>
          <Navigation size={28} className="text-amber-100 shrink-0" />
        </div>
      </div>

      <section className="card min-w-0 border border-violet-100 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Radio size={18} className="text-violet-700" />
              <h2 className="font-bold text-gray-900">Live bus tracker</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">Vehicle location shared by campus transport</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'animate-pulse bg-green-500' : 'bg-gray-400'}`} />
            {isLive ? 'Live' : selectedLocation?.is_sharing ? 'Signal stale' : 'Not sharing'}
          </span>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Select bus to track">
          {busRoutes.map(route => (
            <button
              key={route.id}
              type="button"
              onClick={() => setSelectedBusId(route.id)}
              aria-pressed={selectedBusId === route.id}
              className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${selectedBusId === route.id ? 'border-violet-700 bg-violet-700 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-violet-300'}`}
            >
              {route.number}
            </button>
          ))}
        </div>

        {selectedLocation ? (
          <>
            <BusTrackerMap location={selectedLocation} busLabel={selectedRoute?.number || 'Bus'} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="text-gray-600">
                {selectedRoute?.next_stop ? <>Listed next stop: <span className="font-semibold text-gray-900">{selectedRoute.next_stop}</span></> : 'Latest reported position'}
              </p>
              <a
                href={`https://www.openstreetmap.org/?mlat=${selectedLocation.latitude}&mlon=${selectedLocation.longitude}#map=17/${selectedLocation.latitude}/${selectedLocation.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:text-violet-900"
              >
                Open map <ArrowUpRight size={15} />
              </a>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {isLive ? `Updated ${Math.max(0, Math.floor(locationAge / 1000))} sec ago` : `Last update ${new Date(selectedLocation.updated_at).toLocaleTimeString()}`}
              {selectedLocation.accuracy_m ? ` · GPS accuracy ±${Math.round(selectedLocation.accuracy_m)} m` : ''}
            </p>
          </>
        ) : (
          <div className="mt-4 flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
            <BusFront size={24} className="text-gray-400" />
            <p className="mt-2 text-sm font-semibold text-gray-700">No GPS position yet</p>
            <p className="mt-1 max-w-md text-xs text-gray-500">The map will appear when transport staff start sharing this bus&apos;s location.</p>
          </div>
        )}
        {gpsNotice && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{gpsNotice}</p>}
      </section>

      {busRoutes.length === 0 && <div className="card py-10 text-center text-sm text-gray-500">No campus bus routes have been published yet.</div>}
      {busRoutes.map((route) => (
        <section key={route.number} className="card min-w-0 border border-orange-100">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:mb-6 sm:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
                {route.number}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Bus number</p>
                <h2 className="break-words text-base font-bold text-gray-900 sm:text-lg">{route.name}</h2>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${route.status === 'Bus not coming' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${route.status === 'Bus not coming' ? 'bg-red-500' : 'bg-green-500'}`} /> {route.status}
            </span>
          </div>

          {route.notice && <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-700 sm:mb-6 sm:px-4">{route.notice}</div>}

          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-7 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <Clock3 size={17} className="text-orange-600 mb-2" />
              <p className="text-xs text-gray-400">First departure</p>
              <p className="font-semibold text-gray-900 mt-0.5">{route.departure}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <MapPin size={17} className="text-orange-600 mb-2" />
              <p className="text-xs text-gray-400">Campus arrival</p>
              <p className="font-semibold text-gray-900 mt-0.5">{route.arrival}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <Route size={17} className="text-orange-600 mb-2" />
              <p className="text-xs text-gray-400">Service frequency</p>
              <p className="font-semibold text-gray-900 mt-0.5">{route.frequency}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Route stops</h3>
            <div className="flex flex-col sm:flex-row sm:items-start">
              {route.stops.map((stop, index) => (
                <div key={stop} className="flex flex-col items-start sm:flex-1 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${index === route.stops.length - 1 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      <MapPin size={17} />
                    </div>
                    <div>
                      <p className="break-words text-sm font-semibold text-gray-900">{stop}</p>
                      <p className="text-xs text-gray-400">Stop {index + 1}</p>
                    </div>
                  </div>
                  {index < route.stops.length - 1 && <div className="my-1 ml-[17px] h-7 w-px bg-orange-200 sm:my-4 sm:ml-3 sm:mr-3 sm:h-px sm:w-full" />}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 sm:items-center sm:p-4">
        <ShieldCheck size={19} className="shrink-0 text-blue-600" />
        <p>Arrive at your stop 5 minutes before the scheduled departure.</p>
      </div>
    </div>
  )
}