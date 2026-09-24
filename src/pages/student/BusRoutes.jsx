import { BusFront, Clock3, MapPin, Navigation, Route, ShieldCheck } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'

export default function BusRoutesPage() {
  const { busRoutes } = useApp()
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <BusFront size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bus Routes</h1>
            <p className="text-gray-500 text-sm mt-1">Campus transport timings and stops</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white shadow-lg shadow-orange-200/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-100">Today&apos;s transport</p>
            <h2 className="text-xl font-bold mt-1">Plan your campus trip</h2>
            <p className="text-sm text-amber-50 mt-1">Check the next departure before leaving your stop.</p>
          </div>
          <Navigation size={28} className="text-amber-100 shrink-0" />
        </div>
      </div>

      {busRoutes.map((route) => (
        <section key={route.number} className="card border border-orange-100">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
                {route.number}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Bus number</p>
                <h2 className="text-lg font-bold text-gray-900">{route.name}</h2>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${route.status === 'Bus not coming' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${route.status === 'Bus not coming' ? 'bg-red-500' : 'bg-green-500'}`} /> {route.status}
            </span>
          </div>

          {route.notice && <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{route.notice}</div>}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
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
            <div className="rounded-xl bg-gray-50 p-3 col-span-2 sm:col-span-1">
              <Route size={17} className="text-orange-600 mb-2" />
              <p className="text-xs text-gray-400">Service frequency</p>
              <p className="font-semibold text-gray-900 mt-0.5">{route.frequency}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Route stops</h3>
            <div className="flex flex-col sm:flex-row sm:items-start">
              {route.stops.map((stop, index) => (
                <div key={stop} className="flex sm:flex-1 items-center sm:items-start">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${index === route.stops.length - 1 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      <MapPin size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{stop}</p>
                      <p className="text-xs text-gray-400">Stop {index + 1}</p>
                    </div>
                  </div>
                  {index < route.stops.length - 1 && <div className="w-px h-7 bg-orange-200 ml-4 my-1 sm:w-full sm:h-px sm:ml-3 sm:mr-3 sm:my-4" />}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <ShieldCheck size={19} className="shrink-0 text-blue-600" />
        <p>Arrive at your stop 5 minutes before the scheduled departure.</p>
      </div>
    </div>
  )
}