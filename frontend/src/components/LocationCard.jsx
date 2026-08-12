import { Home, School, Star, MoreVertical, Clock } from 'lucide-react'
import RiskBadge from './RiskBadge'

const ICONS = { home: Home, school: School, star: Star }

export default function LocationCard({ location, onRemove, onMenu }) {
  const Icon = ICONS[location.icon] || Home

  return (
    <div className="bg-surface rounded-xl border border-ink-100 shadow-soft p-5 flex flex-col gap-4 hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center shrink-0">
            <Icon size={18} className="text-forest-700" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-forest-700">{location.type}</p>
            <p className="font-display font-semibold text-ink-900">{location.name}</p>
            <p className="text-xs text-ink-500">{location.region}</p>
          </div>
        </div>
        <button
          onClick={() => onMenu?.(location)}
          className="text-ink-300 hover:text-ink-600 transition-colors p-1"
          aria-label={`Options for ${location.name}`}
        >
          <MoreVertical size={17} />
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono font-bold text-2xl text-ink-900">{location.aqi}</p>
          <RiskBadge aqi={location.aqi} size="sm" />
        </div>
        <div className="flex items-center gap-1 text-xs text-ink-500">
          <Clock size={12} />
          {location.lastUpdated}
        </div>
      </div>

      {onRemove && (
        <button
          onClick={() => onRemove(location.id)}
          className="text-xs font-medium text-ink-500 hover:text-red-600 transition-colors self-start"
        >
          Remove location
        </button>
      )}
    </div>
  )
}
