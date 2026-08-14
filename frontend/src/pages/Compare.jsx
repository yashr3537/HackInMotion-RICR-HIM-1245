import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Trophy,
  BarChart3,
  MapPin,
  Activity,
  Wind,
  Thermometer,
  Droplets,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'

import RiskBadge from '../components/RiskBadge'
import { useLanguage } from '../i18n/index.jsx'

const compareLocations = []

const getRiskMeta = (aqi, t) => {
  if (aqi <= 50) {
    return {
      label: t ? t('aqi.good', { defaultValue: 'Good' }) : 'Good',
      color: '#22A85F',
      bg: '#E6F7EC',
    }
  }

  if (aqi <= 100) {
    return {
      label: t ? t('aqi.moderate', { defaultValue: 'Moderate' }) : 'Moderate',
      color: '#D6A70C',
      bg: '#FBF3D9',
    }
  }

  if (aqi <= 150) {
    return {
      label: t ? t('aqi.sensitive', { defaultValue: 'Sensitive' }) : 'Sensitive',
      color: '#E5822A',
      bg: '#FCEADA',
    }
  }

  if (aqi <= 200) {
    return {
      label: t ? t('aqi.unhealthy', { defaultValue: 'Unhealthy' }) : 'Unhealthy',
      color: '#D8492E',
      bg: '#FBE2DC',
    }
  }

  return {
    label: t ? t('aqi.hazardous', { defaultValue: 'Hazardous' }) : 'Hazardous',
    color: '#B92E3D',
    bg: '#F8DDE1',
  }
}

const getMetricValue = (location, key) => {
  if (key === 'aqi') return Number(location.aqi || 0)
  if (key === 'pm25') return Number(location.pm25 || 0)
  if (key === 'pm10') return Number(location.pm10 || 0)
  if (key === 'no2') return Number(location.no2 || 0)
  if (key === 'temperature') return Number(location.temperature || 0)
  if (key === 'humidity') return Number(location.humidity || 0)

  return 0
}

const METRICS = [
  {
    key: 'aqi',
    label: 'AQI',
    icon: Activity,
    unit: '',
    lowerIsBetter: true,
  },
  {
    key: 'pm25',
    label: 'PM2.5',
    icon: Wind,
    unit: 'µg/m³',
    lowerIsBetter: true,
  },
  {
    key: 'pm10',
    label: 'PM10',
    icon: Wind,
    unit: 'µg/m³',
    lowerIsBetter: true,
  },
  {
    key: 'no2',
    label: 'NO₂',
    icon: Activity,
    unit: 'µg/m³',
    lowerIsBetter: true,
  },
  {
    key: 'temperature',
    label: 'Temperature',
    icon: Thermometer,
    unit: '°C',
    lowerIsBetter: false,
  },
  {
    key: 'humidity',
    label: 'Humidity',
    icon: Droplets,
    unit: '%',
    lowerIsBetter: false,
  },
]

export default function Compare() {
  const { t } = useLanguage()
  const [selected, setSelected] = useState(
    compareLocations.map((location) => location.id),
  )
  const [visible, setVisible] = useState(false)

  const active = useMemo(
    () =>
      compareLocations.filter((location) =>
        selected.includes(location.id),
      ),
    [selected],
  )

  const sortedByAqi = useMemo(
    () => [...active].sort((a, b) => a.aqi - b.aqi),
    [active],
  )

  const best = sortedByAqi.length ? sortedByAqi[0] : null
  const worst = sortedByAqi.length
    ? sortedByAqi[sortedByAqi.length - 1]
    : null

  const averageAqi = useMemo(() => {
    if (!active.length) return 0

    return Math.round(
      active.reduce(
        (sum, location) => sum + Number(location.aqi || 0),
        0,
      ) / active.length,
    )
  }, [active])

  useEffect(() => {
    setVisible(false)

    const timer = window.setTimeout(() => {
      setVisible(true)
    }, 70)

    return () => window.clearTimeout(timer)
  }, [selected.length])

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id],
    )
  }

  return (
    <div className="page-enter flex flex-col gap-7 pb-8 sm:gap-9">
      {/* HEADER */}
      <section className="fade-down">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
          <BarChart3 size={12} />
          {t('compare.tag', { defaultValue: 'Environmental comparison' })}
        </div>

        <h1 className="max-w-3xl font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
          {t('compare.title', { defaultValue: 'Compare the air around you.' })}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
          {t('compare.subtitle', { defaultValue: 'Compare current air-quality conditions across multiple locations and quickly understand which area currently has the lower AQI.' })}
        </p>
      </section>

      {/* LOCATION SELECTOR */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-surface p-5 shadow-soft sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-forest-400/6 blur-3xl float-soft" />

          <div className="relative z-10">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                  {t('compare.chooseLocations', { defaultValue: 'Choose locations' })}
                </p>

                <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">
                  {t('compare.question', { defaultValue: 'What do you want to compare?' })}
                </h2>
              </div>

              <span className="text-xs text-ink-400">
                {t('compare.selectedCount', { count: active.length, defaultValue: `${active.length} selected` })}
              </span>
            </div>

            <div className="stagger-children flex flex-wrap gap-2.5">
              {compareLocations.map((location) => {
                const isSelected = selected.includes(location.id)

                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => toggle(location.id)}
                    className={`btn-premium inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      isSelected
                        ? 'border-forest-700 bg-forest-700 text-white shadow-sm'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-forest-200 hover:text-forest-800'
                    }`}
                  >
                    {isSelected && (
                      <Check
                        size={14}
                        className="animate-pulse"
                      />
                    )}

                    {location.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          EMPTY STATE
      ====================================================== */}
      {active.length === 0 ? (
        <section className="fade-up">
          <div className="rounded-2xl border border-ink-100 bg-surface p-10 text-center shadow-soft">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-700">
              <BarChart3 size={20} />
            </div>

            <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">
              Select at least one location
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
              Choose one or more locations above to begin comparing current
              environmental conditions.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* =================================================
              SUMMARY
          ================================================== */}
          <section className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                <MapPin size={12} />
                Selected
              </div>

              <div className="mt-2 font-mono text-2xl font-bold text-ink-900">
                {active.length}
              </div>

              <p className="mt-1 text-[10px] text-ink-500">
                Locations
              </p>
            </div>

            <div className="card-hover rounded-xl border border-forest-100 bg-forest-50 p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-forest-700">
                <Trophy size={12} />
                Best
              </div>

              <div className="mt-2 font-mono text-2xl font-bold text-forest-800">
                {best?.aqi ?? '--'}
              </div>

              <p className="mt-1 truncate text-[10px] text-forest-700/70">
                {best?.name || '—'}
              </p>
            </div>

            <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                <Activity size={12} />
                Average
              </div>

              <div className="mt-2 font-mono text-2xl font-bold text-ink-900">
                {averageAqi}
              </div>

              <p className="mt-1 text-[10px] text-ink-500">
                Average AQI
              </p>
            </div>

            <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                <Activity size={12} />
                Highest
              </div>

              <div className="mt-2 font-mono text-2xl font-bold text-ink-900">
                {worst?.aqi ?? '--'}
              </div>

              <p className="mt-1 truncate text-[10px] text-ink-500">
                {worst?.name || '—'}
              </p>
            </div>
          </section>

          {/* =================================================
              LOCATION CARDS
          ================================================== */}
          <section>
            <div className="fade-up mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-forest-700">
                  Current conditions
                </p>

                <h2 className="mt-1 font-display text-lg font-semibold text-ink-900 sm:text-xl">
                  Location comparison
                </h2>
              </div>

              <span className="text-[10px] uppercase tracking-[0.12em] text-ink-400">
                Lower AQI is better
              </span>
            </div>

            <div
              className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 ${
                visible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-3 opacity-0'
              }`}
            >
              {sortedByAqi.map((location, index) => {
                const isBest = best?.id === location.id
                const isWorst = worst?.id === location.id
                const risk = getRiskMeta(location.aqi)

                return (
                  <div
                    key={location.id}
                    className={`card-hover card-glow group relative overflow-hidden rounded-2xl border p-5 shadow-soft ${
                      isBest
                        ? 'border-forest-200 bg-forest-50'
                        : 'border-ink-100 bg-surface'
                    }`}
                    style={{
                      animationDelay: `${index * 80}ms`,
                    }}
                  >
                    {/* Ambient glow */}
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125"
                      style={{
                        backgroundColor: risk.color,
                        opacity: 0.05,
                      }}
                    />

                    <div className="relative z-10">
                      {isBest && (
                        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-white px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-forest-800">
                          <Trophy size={10} />
                          Best current air
                        </div>
                      )}

                      {!isBest && isWorst && (
                        <div
                          className="mb-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]"
                          style={{
                            color: risk.color,
                            backgroundColor: risk.bg,
                            borderColor: `${risk.color}25`,
                          }}
                        >
                          Highest AQI
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-display text-lg font-semibold text-ink-900">
                            {location.name}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                            <MapPin size={11} />
                            {location.region}
                          </p>
                        </div>

                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{
                            backgroundColor: risk.color,
                            boxShadow: `0 0 10px ${risk.color}55`,
                          }}
                        />
                      </div>

                      <div className="mt-7">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                              AQI
                            </p>

                            <p
                              className="mt-1 font-mono text-4xl font-bold tracking-[-0.05em]"
                              style={{
                                color: isBest
                                  ? '#166B3E'
                                  : '#18221E',
                              }}
                            >
                              {location.aqi}
                            </p>
                          </div>

                          <RiskBadge
                            aqi={location.aqi}
                            size="sm"
                          />
                        </div>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-100">
                          <div
                            className="progress-fill h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                (location.aqi / 300) * 100,
                                100,
                              )}%`,
                              backgroundColor: risk.color,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4 text-[10px] text-ink-400">
                        <span>Current reading</span>

                        <span
                          className="font-semibold"
                          style={{
                            color: risk.color,
                          }}
                        >
                          {risk.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* =================================================
              METRIC COMPARISON
          ================================================== */}
          <section className="fade-up">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-forest-700">
                Environmental metrics
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-ink-900 sm:text-xl">
                Compare pollutant and weather readings
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-surface shadow-soft">
              <table className="w-full min-w-[680px] border-collapse">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/70">
                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                      Metric
                    </th>

                    {sortedByAqi.map((location) => (
                      <th
                        key={location.id}
                        className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-500"
                      >
                        {location.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {METRICS.map((metric) => {
                    const Icon = metric.icon

                    return (
                      <tr
                        key={metric.key}
                        className="border-b border-ink-100 last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                              <Icon size={14} />
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-ink-800">
                                {metric.label}
                              </p>

                              {metric.unit && (
                                <p className="text-[9px] text-ink-400">
                                  {metric.unit}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {sortedByAqi.map((location) => {
                          const value = getMetricValue(
                            location,
                            metric.key,
                          )

                          return (
                            <td
                              key={`${location.id}-${metric.key}`}
                              className="px-5 py-4"
                            >
                              <span className="font-mono text-sm font-semibold text-ink-900">
                                {value || '--'}
                                {metric.unit && value
                                  ? ` ${metric.unit}`
                                  : ''}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* =================================================
              INSIGHT
          ================================================== */}
          <section className="fade-up">
            <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-5 sm:p-6">
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-forest-400/10 blur-3xl float-soft" />

              <div className="relative flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 shadow-sm">
                  <Sparkles size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    Current comparison insight
                  </p>

                  <p className="mt-1 text-xs leading-6 text-ink-600">
                    {best?.name} currently has the lowest AQI among the
                    selected locations at {best?.aqi}. {worst?.name} has the
                    highest at {worst?.aqi}. Conditions can change, so use
                    live readings again before making an outdoor decision.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              NOTE
          ================================================== */}
          <p className="fade-up text-[10px] leading-5 text-ink-400">
            Comparison uses the currently available location data in the
            application. Values are environmental readings and should not be
            interpreted as a medical assessment.
          </p>
        </>
      )}
    </div>
  )
}