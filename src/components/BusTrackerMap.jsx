import { divIcon } from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const busIcon = divIcon({
  className: '',
  html: '<span style="display:block;width:24px;height:24px;border:4px solid white;border-radius:50%;background:#6d28d9;box-shadow:0 2px 12px #11182766"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function FollowBus({ position }) {
  const map = useMap()
  const latitude = position[0]
  const longitude = position[1]

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), { animate: true })
  }, [map, latitude, longitude])

  return null
}

export function BusTrackerMap({ location, busLabel }) {
  const position = [Number(location.latitude), Number(location.longitude)]

  return (
    <div className="mt-4 h-[min(56vw,360px)] min-h-55 overflow-hidden rounded-xl border border-gray-200">
      <MapContainer
        key={location.bus_id}
        center={position}
        zoom={16}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
      >
        <FollowBus position={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <Marker position={position} icon={busIcon} title={busLabel}>
          <Popup>{busLabel}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}