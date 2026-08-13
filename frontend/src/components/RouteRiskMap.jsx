import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [23.2599, 77.4126]

const createIcon = (color) =>
  L.divIcon({
    className: 'aeroguard-map-marker',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: ${color};
        border: 3px solid rgba(255,255,255,0.95);
        box-shadow: 0 0 0 5px ${color}22, 0 5px 16px rgba(0,0,0,0.18);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })

const startIcon = createIcon('#166B3E')
const endIcon = createIcon('#D8492E')

function FitRoute({ positions }) {
  const map = useMap()

  useEffect(() => {
    if (!positions?.length) return

    const bounds = L.latLngBounds(positions)
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 14,
    })
  }, [map, positions])

  return null
}

export default function RouteRiskMap({
  route = [],
  start,
  end,
  riskSegments = [],
}) {
  const positions = useMemo(() => {
    if (route?.length) return route
    return [DEFAULT_CENTER]
  }, [route])

  const segmentPoints = useMemo(() => {
    return riskSegments.flatMap((segment) =>
      segment.point ? [segment.point] : [],
    )
  }, [riskSegments])

  return (
    <div className="relative h-[360px] overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 shadow-soft sm:h-[460px]">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{
              color: '#166B3E',
              weight: 7,
              opacity: 0.18,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{
              color: '#166B3E',
              weight: 4,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {start && (
          <Marker
            position={start.position}
            icon={startIcon}
          >
            <Popup>
              <strong>Start</strong>
              <br />
              {start.name}
            </Popup>
          </Marker>
        )}

        {end && (
          <Marker
            position={end.position}
            icon={endIcon}
          >
            <Popup>
              <strong>Destination</strong>
              <br />
              {end.name}
            </Popup>
          </Marker>
        )}

        {segmentPoints.map((point, index) => (
          <CircleMarker
            key={`${point[0]}-${point[1]}-${index}`}
            center={point}
            radius={10}
            pathOptions={{
              color:
                riskSegments[index]?.color || '#D6A70C',
              fillColor:
                riskSegments[index]?.color || '#D6A70C',
              fillOpacity: 0.28,
              weight: 2,
            }}
          >
            <Popup>
              <strong>
                {riskSegments[index]?.label || 'Route risk area'}
              </strong>
              {riskSegments[index]?.aqi
                ? ` — AQI ${riskSegments[index].aqi}`
                : ''}
            </Popup>
          </CircleMarker>
        ))}

        <FitRoute positions={positions} />
      </MapContainer>

      {/* Map overlay legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur-md">
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-500">
          Route risk
        </p>

        <div className="flex flex-wrap gap-3 text-[10px] font-medium text-ink-700">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#22A85F]" />
            Lower
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#D6A70C]" />
            Moderate
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#D8492E]" />
            High
          </span>
        </div>
      </div>
    </div>
  )
}