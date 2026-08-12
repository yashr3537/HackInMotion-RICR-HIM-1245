import { MapPin, Clock } from 'lucide-react'
import AQIGauge from './AQIGauge'
import RiskBadge from './RiskBadge'
import { getAqiBand } from '../data/aqiUtils'

export default function AQICard({ location }) {
  const band = getAqiBand(location.aqi)
  return (
    <div className="bg-surface rounded-xl2 shadow-card border border-ink-100 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">Current Air Quality</p>
          <div className="flex items-center gap-1.5 text-ink-700 text-sm mb-4">
            <MapPin size={15} className="text-forest-600" />
            <span>{location.name}, {location.region}</span>
          </div>
          <RiskBadge aqi={location.aqi} size="lg" />
          <p className="text-ink-700 text-sm leading-relaxed mt-4 max-w-sm">{band.advice}</p>
          <div className="flex items-center gap-1.5 text-xs text-ink-500 mt-5">
            <Clock size={13} />
            <span>Last updated: {location.lastUpdated}</span>
          </div>
        </div>
        <div className="flex justify-center sm:justify-end">
          <AQIGauge aqi={location.aqi} size={200} />
        </div>
      </div>
    </div>
  )
}
