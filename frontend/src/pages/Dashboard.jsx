import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Sparkles,
  Activity,
  Loader2,
} from 'lucide-react'

import AQICard from '../components/AQICard'
import PollutantCard from '../components/PollutantCard'
import RecommendationCard from '../components/RecommendationCard'
import DominantPollutantCard from '../components/DominantPollutantCard'
import TrendChart from '../components/TrendChart'
import LocationCard from '../components/LocationCard'

import { useAuth } from '../auth'
import { getAqiBand } from '../data/aqiUtils'
import { getAirQuality } from '../data/airQualityApi'
import { searchLocation } from '../data/locationApi'
import { useLanguage } from '../i18n/index.jsx'

function readSelectedLocation() {
  try {
    const raw = window.localStorage.getItem('selectedAirGuardLocation')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function buildPollutants(data) {
  const metrics = [
    { key: 'pm25', label: 'PM2.5', value: data.pm25, unit: 'µg/m³' },
    { key: 'pm10', label: 'PM10', value: data.pm10, unit: 'µg/m³' },
    { key: 'no2', label: 'NO₂', value: data.no2, unit: 'µg/m³' },
    { key: 'o3', label: 'O₃', value: data.o3, unit: 'µg/m³' },
    { key: 'so2', label: 'SO₂', value: data.so2, unit: 'µg/m³' },
    { key: 'co', label: 'CO', value: data.co, unit: 'mg/m³' },
  ]

  return metrics.map((item) => {
    const numeric = Number(item.value) || 0
    return {
      ...item,
      value: numeric,
      status: numeric > 100 ? 'unhealthy' : numeric > 60 ? 'moderate' : 'good',
      description: item.label,
    }
  })
}

function getRecommendationText(aqi) {
  const band = getAqiBand(Number(aqi) || 0)

  if (band.key === 'good') {
    return {
      headline: 'Air quality is looking favourable right now.',
      detail: 'This is a good time for regular outdoor activity and light exercise.',
      profile: 'General user',
      activity: 'Outdoor activity',
      verdict: 'Generally fine',
    }
  }

  if (band.key === 'moderate') {
    return {
      headline: 'Air quality is acceptable with a little caution.',
      detail: 'Sensitive groups should limit prolonged outdoor exposure and keep an eye on symptoms.',
      profile: 'General user',
      activity: 'Outdoor activity',
      verdict: 'Use caution',
    }
  }

  if (band.key === 'sensitive') {
    return {
      headline: 'Sensitive groups should reduce outdoor exposure.',
      detail: 'Shorter sessions and more frequent breaks are recommended if you are sensitive to pollution.',
      profile: 'Sensitive profile',
      activity: 'Outdoor work or exercise',
      verdict: 'Take precautions',
    }
  }

  return {
    headline: 'Current conditions are not ideal for prolonged outdoor activity.',
    detail: 'Consider rescheduling high-exertion activity and reduce time outdoors where possible.',
    profile: 'General user',
    activity: 'Indoor alternatives preferred',
    verdict: 'Avoid prolonged exposure',
  }
}

export default function Dashboard() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()

  const [location, setLocation] = useState({
    name: 'Current location',
    region: 'Fetching live data...',
    aqi: null,
    lastUpdated: '--',
    pm25: null,
    pm10: null,
    no2: null,
    o3: null,
    so2: null,
    co: null,
  })
  const [pollutants, setPollutants] = useState([])
  const [recommendation, setRecommendation] = useState({
    headline: 'Loading live guidance...',
    detail: 'Please wait while AirGuard fetches the latest air-quality conditions.',
    profile: 'General user',
    activity: 'Outdoor activity',
    verdict: 'Loading',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const storedLocation = readSelectedLocation()
        let resolvedLocation = storedLocation

        if (!resolvedLocation && navigator.geolocation) {
          resolvedLocation = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                })
              },
              () => reject(new Error('Location permission denied')),
              { enableHighAccuracy: true, timeout: 8000 },
            )
          })
        }

        if (!resolvedLocation) {
          const fallback = await searchLocation('Bhopal')
          const first = fallback?.[0]

          if (!first) {
            throw new Error('No location data available.')
          }

          resolvedLocation = first
        }

        const airQuality = await getAirQuality(
          Number(resolvedLocation.latitude ?? resolvedLocation.lat ?? 23.2599),
          Number(resolvedLocation.longitude ?? resolvedLocation.lng ?? 77.4126),
        )

        if (cancelled) return

        const nextLocation = {
          ...resolvedLocation,
          name: resolvedLocation.name || 'Selected location',
          region: resolvedLocation.region || resolvedLocation.country || 'Live environmental data',
          aqi: airQuality.aqi ?? null,
          pm25: airQuality.pm25 ?? null,
          pm10: airQuality.pm10 ?? null,
          no2: airQuality.no2 ?? null,
          o3: airQuality.o3 ?? null,
          so2: airQuality.so2 ?? null,
          co: airQuality.co ?? null,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }

        setLocation(nextLocation)
        setPollutants(buildPollutants(nextLocation))
        setRecommendation(getRecommendationText(nextLocation.aqi))
      } catch (loadError) {
        console.error('Dashboard data error:', loadError)
        if (!cancelled) {
          setError('Unable to fetch live air-quality data right now. Please try again.')
          setLocation({
            name: 'Current location',
            region: 'Live data unavailable',
            aqi: null,
            lastUpdated: '--',
            pm25: null,
            pm10: null,
            no2: null,
            o3: null,
            so2: null,
            co: null,
          })
          setPollutants([])
          setRecommendation({
            headline: 'Live data is temporarily unavailable.',
            detail: 'Please retry after a moment or choose a different location.',
            profile: 'General user',
            activity: 'Air quality update',
            verdict: 'Unavailable',
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? t('dashboard.greetingMorning') : hour < 18 ? t('dashboard.greetingAfternoon') : t('dashboard.greetingEvening')
  const userName = currentUser?.name || 'there'
  const summaryLocation = location.name || 'Current location'

  return (
    <div className="page-enter flex flex-col gap-8 pb-8 sm:gap-10">
      <section className="fade-down">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
              <Sparkles size={12} />
              {t('dashboard.environmentalOverview')}
            </div>

            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
              {greeting}, {userName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-forest-600" />
                {summaryLocation}, {location.region || 'Live data'}
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-ink-300 sm:block" />

              <span className="inline-flex items-center gap-1.5">
                <Activity size={13} className="text-forest-600" />
                {t('dashboard.liveEnvironmentalData')}
              </span>
            </div>
          </div>

          <div className="stagger-children flex flex-wrap gap-2.5">
            <Link to="/alerts" className="btn-premium inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink-700 hover:border-forest-200 hover:text-forest-800">
              <BellRing size={15} />
              {t('nav.alerts')}
            </Link>

            <Link to="/locations" className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800">
              <MapPin size={15} />
              {t('nav.locations')}
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-ink-100 bg-surface p-4 text-sm text-ink-600">
          <Loader2 size={16} className="animate-spin text-forest-700" />
          Fetching live environmental data...
        </div>
      ) : (
        <>
          <section className="scale-in">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-[28px] bg-forest-400/5 blur-3xl" />
              <div className="relative">
                <AQICard location={location} />
              </div>
            </div>
          </section>

          <section className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400"><ShieldCheck size={12} />{t('dashboard.riskLabel')}</div>
              <div className="mt-2 text-sm font-semibold text-ink-900">{t('dashboard.personalised')}</div>
              <div className="mt-1 text-[10px] text-ink-500">{t('dashboard.basedOnProfile')}</div>
            </div>

            <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400"><MapPin size={12} />{t('dashboard.locationLabel')}</div>
              <div className="mt-2 truncate text-sm font-semibold text-ink-900">{summaryLocation}</div>
              <div className="mt-1 text-[10px] text-ink-500">{t('dashboard.primaryMonitoredArea')}</div>
            </div>

            <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400"><CalendarDays size={12} />{t('dashboard.tracking')}</div>
              <div className="mt-2 text-sm font-semibold text-ink-900">Live</div>
              <div className="mt-1 text-[10px] text-ink-500">{t('dashboard.savedForMonitoring')}</div>
            </div>

            <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400"><BellRing size={12} />{t('nav.alerts')}</div>
              <div className="mt-2 text-sm font-semibold text-ink-900">0</div>
              <div className="mt-1 text-[10px] text-ink-500">{t('dashboard.environmentalNotifications')}</div>
            </div>
          </section>

          <section>
            <div className="fade-up mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">{t('dashboard.environmentalMetrics')}</p>
                <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">{t('dashboard.pollutantBreakdown')}</h2>
              </div>
              <p className="text-xs text-ink-500">{t('dashboard.currentReadingsFor', { location: summaryLocation })}</p>
            </div>

            <div className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
              {pollutants.length > 0 ? (
                pollutants.map((pollutant) => <PollutantCard key={pollutant.key} pollutant={pollutant} />)
              ) : (
                <div className="col-span-full rounded-xl border border-ink-100 bg-surface p-4 text-sm text-ink-600">No pollutant readings available for the selected location.</div>
              )}
            </div>
          </section>

          <section className="grid gap-5 sm:gap-6 lg:grid-cols-5">
            <div className="fade-left lg:col-span-3">
              <RecommendationCard recommendation={recommendation} />
            </div>

            <div className="fade-right lg:col-span-2" style={{ animationDelay: '120ms' }}>
              <DominantPollutantCard data={{
                label: 'Current dominant pollutant',
                description: location.aqi !== null ? `The current air-quality trend is driven by real-time environmental readings for ${summaryLocation}.` : 'Awaiting live readings.',
                percentOfLimit: location.aqi !== null ? Math.min(100, Number(location.aqi) / 3) : 0,
              }} />
            </div>
          </section>

          <section className="fade-up">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">{t('dashboard.historicalContext')}</p>
                <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">{t('dashboard.howAirIsChanging')}</h2>
              </div>

              <Link to="/history" className="group hidden items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800 sm:flex">
                {t('dashboard.fullHistory')}
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <TrendChart />
          </section>

          <section>
            <div className="fade-up mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">{t('dashboard.placesThatMatter')}</p>
                <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">{t('dashboard.myLocations')}</h2>
              </div>

              <Link to="/locations" className="group inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800">
                {t('dashboard.viewAll')}
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <LocationCard location={{ id: 'live-location', type: 'Current', icon: 'home', name: summaryLocation, region: location.region || 'Live data', aqi: location.aqi ?? 0, lastUpdated: location.lastUpdated || 'Just now' }} />
            </div>
          </section>

          <section className="fade-up">
            <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-6 sm:p-7">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-forest-400/10 blur-3xl float-soft" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-forest-700">
                    <ShieldCheck size={13} />
                    {t('dashboard.keepYourEnvironmentClose')}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">{t('dashboard.exploreAnotherLocationQuestion')}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-600">{t('dashboard.searchNewArea')}</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Link to="/locations" className="btn-premium inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-xs font-semibold text-forest-800 hover:bg-forest-50">
                    {t('dashboard.exploreLocations')}
                    <ArrowRight size={14} />
                  </Link>

                  <Link to="/activity" className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-forest-800">
                    {t('dashboard.checkActivityRisk')}
                    <Activity size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
