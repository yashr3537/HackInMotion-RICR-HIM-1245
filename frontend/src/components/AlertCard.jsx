import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  MapPin,
  Clock3,
  Activity,
  ArrowRight,
} from 'lucide-react'

const SEVERITY = {
  critical: {
    icon: AlertTriangle,
    color: '#D8492E',
    bg: '#FBE2DC',
    softBg: 'rgba(216, 73, 46, 0.09)',
    border: 'rgba(216, 73, 46, 0.18)',
    label: 'Critical',
  },

  warning: {
    icon: AlertCircle,
    color: '#D6A70C',
    bg: '#FBF3D9',
    softBg: 'rgba(214, 167, 12, 0.09)',
    border: 'rgba(214, 167, 12, 0.18)',
    label: 'Warning',
  },

  info: {
    icon: Info,
    color: '#166B3E',
    bg: '#E6F7EC',
    softBg: 'rgba(22, 107, 62, 0.08)',
    border: 'rgba(22, 107, 62, 0.16)',
    label: 'Information',
  },
}

export default function AlertCard({ alert }) {
  const meta = SEVERITY[alert.severity] || SEVERITY.info
  const Icon = meta.icon

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true)
    }, 60)

    return () => window.clearTimeout(timer)
  }, [alert])

  return (
    <div
      className={`card-hover card-glow group relative overflow-hidden rounded-xl border p-4 transition-all duration-500 sm:p-5 ${
        alert.read
          ? 'border-ink-100 bg-surface shadow-soft'
          : 'border-ink-200 bg-white shadow-soft'
      } ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-3 opacity-0'
      }`}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: meta.color,
      }}
    >
      {/* Subtle severity glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125"
        style={{
          backgroundColor: meta.color,
          opacity: alert.read ? 0.035 : 0.07,
        }}
      />

      <div className="relative z-10 flex gap-4">
        {/* Icon */}
        <div
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2"
          style={{
            backgroundColor: meta.bg,
            borderColor: meta.border,
          }}
        >
          <Icon
            size={18}
            style={{ color: meta.color }}
            strokeWidth={2.2}
          />

          {/* Unread pulse */}
          {!alert.read && (
            <span
              className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full"
              style={{ backgroundColor: meta.color }}
            >
              <span
                className="absolute h-3 w-3 animate-ping rounded-full"
                style={{
                  backgroundColor: meta.color,
                  opacity: 0.3,
                }}
              />
            </span>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {alert.title}
                </p>

                <span
                  className="rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]"
                  style={{
                    backgroundColor: meta.softBg,
                    color: meta.color,
                    borderColor: meta.border,
                  }}
                >
                  {meta.label}
                </span>
              </div>
            </div>

            {!alert.read && (
              <span
                className="mt-1 flex h-2 w-2 shrink-0 rounded-full"
                aria-label="Unread alert"
                style={{
                  backgroundColor: meta.color,
                  boxShadow: `0 0 10px ${meta.color}70`,
                }}
              />
            )}
          </div>

          {/* Message */}
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-700">
            {alert.message}
          </p>

          {/* Metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} className="text-ink-400" />
              {alert.location}
            </span>

            {alert.aqi !== undefined && alert.aqi !== null && (
              <span className="inline-flex items-center gap-1.5">
                <Activity size={12} className="text-ink-400" />
                <span className="font-mono font-semibold text-ink-700">
                  AQI {alert.aqi}
                </span>
              </span>
            )}

            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={12} className="text-ink-400" />
              {alert.time}
            </span>
          </div>

          {/* Bottom action/status */}
          <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-400">
              Environmental alert
            </span>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-300 hover:translate-x-1"
              style={{ color: meta.color }}
            >
              View details
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}