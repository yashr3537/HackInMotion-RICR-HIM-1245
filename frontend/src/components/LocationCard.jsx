import { useEffect, useState } from 'react'
import {
  Home,
  School,
  Star,
  MoreVertical,
  Clock,
  MapPin,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import RiskBadge from './RiskBadge'

const ICONS = {
  home: Home,
  school: School,
  star: Star,
}

export default function LocationCard({
  location,
  onRemove,
  onMenu,
}) {
  const Icon = ICONS[location.icon] || Home
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true)
    }, 70)

    return () => window.clearTimeout(timer)
  }, [location])

  return (
    <div
      className={`card-hover card-glow group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-ink-100 bg-surface p-5 shadow-soft transition-all duration-500 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-3 opacity-0'
      }`}
    >
      {/* Soft ambient glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-forest-400/6 blur-3xl transition-transform duration-700 group-hover:scale-125" />

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {/* Location icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-forest-100 bg-forest-50 transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2">
            <Icon
              size={18}
              className="text-forest-700 transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {/* Location info */}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">
              {location.type}
            </p>

            <p className="mt-0.5 truncate font-display font-semibold text-ink-900">
              {location.name}
            </p>

            <div className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{location.region}</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <button
          type="button"
          onClick={() => onMenu?.(location)}
          className="icon-hover rounded-lg p-1.5 text-ink-300 transition-colors hover:bg-ink-50 hover:text-ink-700"
          aria-label={`Options for ${location.name}`}
        >
          <MoreVertical size={17} />
        </button>
      </div>

      {/* =====================================================
          AQI SECTION
      ====================================================== */}
      <div className="relative z-10 rounded-xl border border-ink-100 bg-ink-50/50 p-4">
        <div className="flex items-end justify-between gap-4">
          {/* AQI */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-400">
              <Activity size={11} />
              Current AQI
            </div>

            <p className="mt-1 font-mono text-3xl font-bold tracking-[-0.05em] text-ink-900 tabular-nums">
              {location.aqi}
            </p>

            <div className="mt-1.5">
              <RiskBadge
                aqi={location.aqi}
                size="sm"
              />
            </div>
          </div>

          {/* Update status */}
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-400">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-600" />
              Live
            </div>

            <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-ink-500">
              <Clock size={12} />
              {location.lastUpdated}
            </div>
          </div>
        </div>

        {/* Mini visual bar */}
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
            <div
              className="progress-fill h-full rounded-full bg-forest-600"
              style={{
                width: `${Math.min((Number(location.aqi) / 300) * 100, 100)}%`,
              }}
            />
          </div>

          <div className="mt-1 flex justify-between text-[9px] text-ink-400">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div className="relative z-10 flex items-center justify-between gap-3 border-t border-ink-100 pt-3">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-400">
          <Star size={11} className="text-amber-500" />
          Saved location
        </div>

        <button
          type="button"
          onClick={() => onMenu?.(location)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 transition-all duration-300 hover:translate-x-1 hover:text-forest-800"
        >
          View details
          <ArrowUpRight size={13} />
        </button>
      </div>

      {/* =====================================================
          REMOVE
      ====================================================== */}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(location.id)}
          className="relative z-10 self-start text-xs font-medium text-ink-400 transition-colors hover:text-red-600"
        >
          Remove location
        </button>
      )}
    </div>
  )
}