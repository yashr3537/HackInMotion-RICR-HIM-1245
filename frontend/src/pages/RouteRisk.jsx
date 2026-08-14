import { useMemo, useState } from 'react'
import {
  ArrowRight,
  MapPin,
  Navigation,
  Route,
  ShieldCheck,
  Clock3,
  Wind,
  Activity,
  AlertTriangle,
  Search,
} from 'lucide-react'

import RouteRiskMap from '../components/RouteRiskMap'
import { useLanguage } from '../i18n/index.jsx'

const SAMPLE_LOCATIONS = {
  home: {
    name: 'Home',
    address: 'Bhopal',
    position: [23.2599, 77.4126],
  },
  park: {
    name: 'City Park',
    address: 'Bhopal',
    position: [23.2275, 77.4348],
  },
  work: {
    name: 'Work',
    address: 'Bhopal',
    position: [23.2501, 77.4072],
  },
}

const SAMPLE_ROUTES = {
  'home-park': {
    distance: '6.8 km',
    duration: '32 min',
    averageAqi: 118,
    highestRisk: 'High',
    highestRiskSegment: '2.1 – 3.4 km',
    recommendation:
      'Consider travelling outside peak pollution periods or reducing prolonged outdoor exposure.',
    route: [
      [23.2599, 77.4126],
      [23.2542, 77.4164],
      [23.2482, 77.4213],
      [23.2415, 77.4269],
      [23.2352, 77.4317],
      [23.2275, 77.4348],
    ],
    segments: [
      {
        label: 'Moderate exposure',
        point: [23.2542, 77.4164],
        aqi: 92,
        color: '#D6A70C',
      },
      {
        label: 'Higher pollution zone',
        point: [23.2415, 77.4269],
        aqi: 168,
        color: '#D8492E',
      },
      {
        label: 'Moderate exposure',
        point: [23.2352, 77.4317],
        aqi: 126,
        color: '#D6A70C',
      },
    ],
  },

  'home-work': {
    distance: '4.2 km',
    duration: '21 min',
    averageAqi: 86,
    highestRisk: 'Moderate',
    highestRiskSegment: '1.4 – 2.0 km',
    recommendation:
      'Current conditions appear manageable, but monitor air quality before starting.',
    route: [
      [23.2599, 77.4126],
      [23.2572, 77.4115],
      [23.2548, 77.4101],
      [23.2521, 77.4092],
      [23.2501, 77.4072],
    ],
    segments: [
      {
        label: 'Moderate exposure',
        point: [23.2548, 77.4101],
        aqi: 104,
        color: '#D6A70C',
      },
      {
        label: 'Lower exposure',
        point: [23.2521, 77.4092],
        aqi: 72,
        color: '#22A85F',
      },
    ],
  },

  'work-park': {
    distance: '5.1 km',
    duration: '25 min',
    averageAqi: 101,
    highestRisk: 'Moderate',
    highestRiskSegment: '2.4 – 3.2 km',
    recommendation:
      'A moderate-risk route is available. Check current readings again before departure.',
    route: [
      [23.2501, 77.4072],
      [23.2468, 77.4132],
      [23.2408, 77.4203],
      [23.2352, 77.4274],
      [23.2275, 77.4348],
    ],
    segments: [
      {
        label: 'Moderate exposure',
        point: [23.2408, 77.4203],
        aqi: 112,
        color: '#D6A70C',
      },
      {
        label: 'Moderate exposure',
        point: [23.2352, 77.4274],
        aqi: 108,
        color: '#D6A70C',
      },
    ],
  },
}

function getRiskMeta(aqi, t) {
  if (aqi <= 50) {
    return {
      label: t ? t('aqi.good', { defaultValue: 'Good' }) : 'Good',
      color: '#22A85F',
      bg: '#EAF7EE',
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
      label: t
        ? t('aqi.sensitive', { defaultValue: 'Unhealthy for sensitive groups' })
        : 'Unhealthy for sensitive groups',
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

function RouteInput({ label, value, onChange, selectLabel }) {
  return (
    <div className="group">
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-400">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-3.5 py-3 transition-all duration-300 focus-within:border-forest-300 focus-within:shadow-[0_0_0_4px_rgba(34,168,95,0.06)]">
        <MapPin size={16} className="shrink-0 text-forest-700" />

        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink-900 outline-none"
        >
          <option value="">{selectLabel}</option>

          {Object.entries(SAMPLE_LOCATIONS).map(([key, location]) => (
            <option key={key} value={key}>
              {location.name} — {location.address}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function RouteRisk() {
  const { t } = useLanguage()
  const [from, setFrom] = useState('home')
  const [to, setTo] = useState('park')
  const [analyzed, setAnalyzed] = useState(false)

  const routeKey = `${from}-${to}`

  const result = useMemo(() => {
    if (!from || !to || from === to) return null

    return SAMPLE_ROUTES[routeKey] || SAMPLE_ROUTES['home-park']
  }, [from, to, routeKey])

  const fromLocation = from ? SAMPLE_LOCATIONS[from] : null

  const toLocation = to ? SAMPLE_LOCATIONS[to] : null

  const riskMeta = result ? getRiskMeta(result.averageAqi, t) : getRiskMeta(0, t)

  function handleAnalyze() {
    if (!from || !to || from === to) return
    setAnalyzed(true)
  }

  function handleSwap() {
    setFrom(to)
    setTo(from)
    setAnalyzed(false)
  }

  return (
    <div className="page-enter flex flex-col gap-7 pb-8 sm:gap-9">
      {/* HEADER */}
      <section className="fade-down">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
          <Route size={12} />
          {t('routeRisk.tag', { defaultValue: 'Route environmental risk' })}
        </div>

        <h1 className="max-w-3xl font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
          {t('routeRisk.title', { defaultValue: 'Check the air along your route.' })}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
          {t('routeRisk.subtitle', {
            defaultValue:
              'Understand environmental exposure before you start your commute, walk, run or outdoor activity.',
          })}
        </p>
      </section>

      {/* ROUTE INPUT PANEL */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-[28px] border border-ink-100 bg-surface p-5 shadow-soft sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-forest-400/6 blur-3xl float-soft" />

          <div className="relative grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
            <RouteInput
              label={t('routeRisk.from', { defaultValue: 'From' })}
              value={from}
              selectLabel={t('routeRisk.selectLocation', { defaultValue: 'Select location' })}
              onChange={(value) => {
                setFrom(value)
                setAnalyzed(false)
              }}
            />

            <button
              type="button"
              onClick={handleSwap}
              className="btn-premium mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-500 hover:border-forest-200 hover:text-forest-700"
              aria-label={t('routeRisk.swap', { defaultValue: 'Swap route locations' })}
            >
              <Navigation size={17} className="rotate-90" />
            </button>

            <RouteInput
              label={t('routeRisk.to', { defaultValue: 'To' })}
              value={to}
              selectLabel={t('routeRisk.selectLocation', { defaultValue: 'Select location' })}
              onChange={(value) => {
                setTo(value)
                setAnalyzed(false)
              }}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <Search size={13} />
              {t('routeRisk.demoNotice', {
                defaultValue: 'Current demo data is used for route exposure visualization.',
              })}
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!from || !to || from === to}
              className="btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('routeRisk.analyzeRoute', { defaultValue: 'Analyze Route' })}
              <ArrowRight size={15} />
            </button>
          </div>

          {from === to && from && (
            <p className="mt-3 text-xs font-medium text-red-600">
              {t('routeRisk.sameLocationError', {
                defaultValue: 'Start and destination must be different.',
              })}
            </p>
          )}
        </div>
      </section>

      {/* ROUTE RESULT */}
      {analyzed && result && fromLocation && toLocation && (
        <>
          <section className="scale-in">
            <div className="grid gap-5 lg:grid-cols-[1.55fr_0.85fr]">
              {/* MAP */}
              <div className="relative">
                <RouteRiskMap
                  route={result.route}
                  start={fromLocation}
                  end={toLocation}
                  riskSegments={result.segments}
                />
              </div>

              {/* SUMMARY */}
              <div
                className="card-glow relative overflow-hidden rounded-2xl border p-5 sm:p-6"
                style={{
                  backgroundColor: `${riskMeta.color}05`,
                  borderColor: `${riskMeta.color}20`,
                }}
              >
                <div
                  className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full blur-3xl"
                  style={{
                    backgroundColor: riskMeta.color,
                    opacity: 0.06,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-400">
                        {t('routeRisk.cardTitle', { defaultValue: 'Route risk' })}
                      </p>

                      <h2 className="mt-1 font-display text-xl font-semibold text-ink-900">
                        {fromLocation.name} → {toLocation.name}
                      </h2>
                    </div>

                    <span
                      className="rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]"
                      style={{
                        color: riskMeta.color,
                        backgroundColor: riskMeta.bg,
                        borderColor: `${riskMeta.color}25`,
                      }}
                    >
                      {riskMeta.label}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-ink-100 bg-white/70 p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                        {t('routeRisk.distance', { defaultValue: 'Distance' })}
                      </p>

                      <p className="mt-1 font-mono text-xl font-bold text-ink-900">
                        {result.distance}
                      </p>
                    </div>

                    <div className="rounded-xl border border-ink-100 bg-white/70 p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                        {t('routeRisk.duration', { defaultValue: 'Duration' })}
                      </p>

                      <p className="mt-1 font-mono text-xl font-bold text-ink-900">
                        {result.duration}
                      </p>
                    </div>

                    <div className="rounded-xl border border-ink-100 bg-white/70 p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                        {t('routeRisk.averageAQI', { defaultValue: 'Avg. AQI' })}
                      </p>

                      <p
                        className="mt-1 font-mono text-xl font-bold"
                        style={{
                          color: riskMeta.color,
                        }}
                      >
                        {result.averageAqi}
                      </p>
                    </div>

                    <div className="rounded-xl border border-ink-100 bg-white/70 p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                        {t('routeRisk.peakRisk', { defaultValue: 'Peak risk' })}
                      </p>

                      <p
                        className="mt-1 text-sm font-semibold"
                        style={{
                          color: riskMeta.color,
                        }}
                      >
                        {result.highestRisk}
                      </p>
                    </div>
                  </div>

                  <div
                    className="mt-5 rounded-xl border p-4"
                    style={{
                      backgroundColor: riskMeta.bg,
                      borderColor: `${riskMeta.color}1D`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        size={16}
                        className="mt-0.5 shrink-0"
                        style={{
                          color: riskMeta.color,
                        }}
                      />

                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{
                            color: riskMeta.color,
                          }}
                        >
                          {t('routeRisk.highestRiskSegment', {
                            defaultValue: 'Highest-risk segment',
                          })}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-ink-600">
                          {result.highestRiskSegment}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                      <ShieldCheck size={16} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-ink-900">
                        {t('routeRisk.recommendation', { defaultValue: 'Recommendation' })}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-ink-500">{result.recommendation}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-ink-100 pt-4 text-[10px] uppercase tracking-[0.12em] text-ink-400">
                    <Clock3 size={12} />
                    {t('routeRisk.recheckNotice', {
                      defaultValue: 'Recheck conditions before departure',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* EXPOSURE BREAKDOWN */}
          <section className="fade-up">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-forest-700">
                {t('routeRisk.exposureBreakdown', { defaultValue: 'Exposure breakdown' })}
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">
                {t('routeRisk.breakdownTitle', {
                  defaultValue: 'Environmental conditions along your route',
                })}
              </h2>
            </div>

            <div className="stagger-children grid gap-4 sm:grid-cols-3">
              <div className="card-hover rounded-xl border border-ink-100 bg-surface p-5 shadow-soft">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                  <Activity size={16} />
                </div>

                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                  {t('routeRisk.averageExposure', { defaultValue: 'Average exposure' })}
                </p>

                <p className="mt-1 text-lg font-semibold text-ink-900">{result.averageAqi} AQI</p>
              </div>

              <div className="card-hover rounded-xl border border-ink-100 bg-surface p-5 shadow-soft">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <AlertTriangle size={16} />
                </div>

                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                  {t('routeRisk.highestRiskZone', { defaultValue: 'Highest-risk zone' })}
                </p>

                <p className="mt-1 text-lg font-semibold text-ink-900">
                  {result.highestRiskSegment}
                </p>
              </div>

              <div className="card-hover rounded-xl border border-ink-100 bg-surface p-5 shadow-soft">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <Wind size={16} />
                </div>

                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                  {t('routeRisk.decisionSupport', { defaultValue: 'Decision support' })}
                </p>

                <p className="mt-1 text-lg font-semibold text-ink-900">
                  {t('routeRisk.checkBeforeLeaving', { defaultValue: 'Check before leaving' })}
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Empty pre-analysis state */}
      {!analyzed && (
        <section className="fade-up">
          <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-forest-400/10 blur-3xl float-soft" />

            <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 shadow-sm">
                <Route size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {t('routeRisk.readyTitle', { defaultValue: 'Ready to analyze your route' })}
                </p>

                <p className="mt-1 text-xs leading-5 text-ink-500">
                  {t('routeRisk.readySubtitle', {
                    defaultValue:
                      'Select a start point and destination, then analyze the environmental conditions along the route.',
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
