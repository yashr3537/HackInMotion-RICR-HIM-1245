import { useEffect, useState } from 'react'
import {
  MapPin,
  Clock,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import AQIGauge from './AQIGauge'
import RiskBadge from './RiskBadge'
import { getAqiBand } from '../data/aqiUtils'

export default function AQICard({ location, loading, error, onRetry }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true)
    }, 80)

    return () => window.clearTimeout(timer)
  }, [location?.aqi])

  if (loading) {
    return (
      <section className="card-hover relative overflow-hidden rounded-xl2 border border-ink-100 bg-surface p-8 shadow-card flex flex-col items-center justify-center min-h-[280px]">
        <Loader2 size={36} className="text-forest-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-ink-900">Loading live air quality data...</p>
        <p className="text-xs text-ink-500 mt-1">Retrieving latest pollutant measurements</p>
      </section>
    )
  }

  if (error || !location || location.aqi === null || location.aqi === undefined) {
    return (
      <section className="card-hover relative overflow-hidden rounded-xl2 border border-amber-200/60 bg-surface p-8 shadow-card flex flex-col items-center justify-center text-center min-h-[280px]">
        <AlertCircle size={38} className="text-amber-600 mb-3" />
        <h3 className="font-display text-lg font-semibold text-ink-900">
          Live air quality data is currently unavailable
        </h3>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-600">
          {error ||
            'Could not retrieve live AQI readings for this location. Please check your network connection or try again.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-xl bg-forest-700 px-4 py-2 text-xs font-semibold text-white hover:bg-forest-800 transition-colors"
          >
            Try Again
          </button>
        )}
      </section>
    )
  }

  const band = getAqiBand(location.aqi)

  return (
    <section
      className={`card-hover card-glow relative overflow-hidden rounded-xl2 border bg-surface shadow-card transition-all duration-700 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{
        borderColor: `${band.color}22`,
      }}
    >
      {/* =====================================================
          AMBIENT RISK GLOW
      ====================================================== */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl transition-all duration-1000"
        style={{
          backgroundColor: band.color,
          opacity: visible ? 0.08 : 0,
        }}
      />

      <div className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-forest-400/5 blur-3xl float-gentle" />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-9">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          {/* =================================================
              LEFT INFORMATION
          ================================================== */}
          <div>
            {/* Eyebrow */}
            <div className="fade-down flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-ink-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                <Activity size={12} className="text-forest-700" />
                Current Air Quality
              </span>

              <span
                className="inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em]"
                style={{
                  backgroundColor: `${band.color}10`,
                  color: band.color,
                  border: `1px solid ${band.color}20`,
                }}
              >
                <span
                  className="live-dot h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: band.color,
                  }}
                />
                Live
              </span>
            </div>

            {/* Location */}
            <div
              className="fade-up mt-4 flex items-center gap-2 text-sm text-ink-700"
              style={{ animationDelay: '100ms' }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50">
                <MapPin size={15} className="text-forest-600" />
              </div>

              <div>
                <p className="font-medium text-ink-900">{location.name}</p>

                <p className="text-xs text-ink-500">{location.region}</p>
              </div>
            </div>

            {/* Risk */}
            <div className="fade-up mt-5" style={{ animationDelay: '160ms' }}>
              <RiskBadge aqi={location.aqi} size="lg" />
            </div>

            {/* Main guidance */}
            <div
              className="fade-up mt-5 max-w-xl rounded-2xl border border-ink-100 bg-ink-50/60 p-4 sm:p-5"
              style={{ animationDelay: '220ms' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${band.color}12`,
                  }}
                >
                  <ShieldCheck size={15} style={{ color: band.color }} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                    What this means
                  </p>

                  <p className="mt-1.5 text-sm leading-6 text-ink-700">{band.advice}</p>
                </div>
              </div>
            </div>

            {/* Quick metrics */}
            <div
              className="stagger-children mt-5 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3"
              style={{ animationDelay: '280ms' }}
            >
              <div className="card-hover rounded-xl border border-ink-100 bg-white/70 p-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                  AQI Index
                </p>

                <p className="mt-1 font-mono text-xl font-bold tabular-nums text-ink-900">
                  {location.aqi}
                </p>
              </div>

              <div className="card-hover rounded-xl border border-ink-100 bg-white/70 p-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                  Status
                </p>

                <p className="mt-1 text-sm font-semibold" style={{ color: band.color }}>
                  {band.label}
                </p>
              </div>

              <div className="card-hover col-span-2 rounded-xl border border-ink-100 bg-white/70 p-3 sm:col-span-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                  Monitoring
                </p>

                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-600" />
                  Active
                </p>
              </div>
            </div>

            {/* Updated time + action */}
            <div
              className="fade-up mt-5 flex flex-col gap-3 border-t border-ink-100 pt-4 sm:flex-row sm:items-center sm:justify-between"
              style={{ animationDelay: '360ms' }}
            >
              <div className="flex items-center gap-1.5 text-xs text-ink-500">
                <Clock size={13} />
                <span>Last updated: {location.lastUpdated}</span>
              </div>

              <button
                type="button"
                className="btn-premium inline-flex w-fit items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 hover:border-forest-200 hover:text-forest-800"
              >
                View detailed air quality
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

          {/* =================================================
              AQI GAUGE
          ================================================== */}
          <div
            className={`relative flex justify-center lg:justify-end ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transition: 'opacity 800ms ease, transform 900ms cubic-bezier(0.22,1,0.36,1)',
              transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
            }}
          >
            <div className="relative">
              {/* Gauge glow */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{
                  backgroundColor: band.color,
                  opacity: 0.09,
                }}
              />

              <div className="relative rounded-[28px] border border-white/50 bg-white/30 p-3 backdrop-blur-sm">
                <AQIGauge aqi={location.aqi} size={210} />
              </div>

              {/* Gauge label */}
              <div className="mt-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                  Environmental Risk
                </p>

                <p className="mt-1 text-sm font-semibold" style={{ color: band.color }}>
                  {band.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM STATUS STRIP
      ====================================================== */}
      <div
        className="relative z-10 border-t px-6 py-3.5 sm:px-8"
        style={{
          borderColor: `${band.color}14`,
          backgroundColor: `${band.color}05`,
        }}
      >
        <div className="flex flex-col gap-2 text-[10px] sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium uppercase tracking-[0.12em] text-ink-400">
            Environmental monitoring active
          </span>

          <span className="flex items-center gap-2 font-semibold" style={{ color: band.color }}>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: band.color,
                boxShadow: `0 0 8px ${band.color}66`,
              }}
            />
            AQI {location.aqi}
          </span>
        </div>
      </div>
    </section>
  )
}
