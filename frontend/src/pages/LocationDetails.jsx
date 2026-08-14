import { useEffect, useState, useMemo, useCallback } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Loader2,
  RefreshCw,
  Clock,
  ShieldCheck,
  Activity,
  AlertCircle,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  User,
  Baby,
  UserCheck,
  Stethoscope,
  Briefcase,
  Sparkles,
  Info,
} from 'lucide-react'

import AQICard from '../components/AQICard'
import PollutantCard from '../components/PollutantCard'
import AQIGauge from '../components/AQIGauge'
import RiskBadge from '../components/RiskBadge'
import TrendChart from '../components/TrendChart'

import { getAirQuality, getWeather } from '../services/airQuality/airQualityApi'
import { getAqiBand, formatPollutants } from '../data/aqiUtils'
import { useLanguage } from '../i18n/index.jsx'
import { useAuth } from '../auth'
import { loadUserSavedLocations } from '../data/savedLocationsStore'

const HEALTH_PROFILES = [
  { key: 'general', labelKey: 'profile.general', defaultLabel: 'General', icon: User },
  { key: 'child', labelKey: 'profile.child', defaultLabel: 'Child', icon: Baby },
  { key: 'elderly', labelKey: 'profile.elderly', defaultLabel: 'Elderly', icon: UserCheck },
  { key: 'respiratory', labelKey: 'profile.respiratory', defaultLabel: 'Respiratory Sensitive', icon: Stethoscope },
  { key: 'outdoor-worker', labelKey: 'profile.outdoorWorker', defaultLabel: 'Outdoor Worker', icon: Briefcase },
]

function getHealthGuidance(aqi, profileKey) {
  const band = getAqiBand(aqi)

  if (band.key === 'good') {
    return 'Air quality is satisfactory. Everyone can engage in normal outdoor activities without health concerns.'
  }

  if (band.key === 'moderate') {
    switch (profileKey) {
      case 'respiratory':
        return 'Sensitive individuals with asthma or lung conditions should monitor symptoms during outdoor exertion.'
      case 'child':
        return 'Children can play outdoors, but take regular rest breaks if unusual coughing or fatigue occurs.'
      case 'elderly':
        return 'Elderly individuals should consider lighter outdoor activities if feeling sensitive.'
      case 'outdoor-worker':
        return 'Work activities can proceed normally. Maintain hydration and take standard rest breaks.'
      default:
        return 'Air quality is acceptable. Unusually sensitive individuals should monitor how they feel.'
    }
  }

  if (band.key === 'sensitive') {
    switch (profileKey) {
      case 'respiratory':
        return 'Increased risk. Keep quick-relief inhalers nearby and reduce prolonged outdoor activity.'
      case 'child':
        return 'Reduce long or strenuous outdoor play. Prefer indoor activities during high pollution hours.'
      case 'elderly':
        return 'Limit prolonged outdoor physical exertion. Stay in well-ventilated indoor spaces.'
      case 'outdoor-worker':
        return 'Take frequent rest breaks indoors. Consider using protective masks (N95/FFP2) for extended shifts.'
      default:
        return 'Sensitive groups may experience health effects. General public is less likely to be affected.'
    }
  }

  switch (profileKey) {
    case 'respiratory':
      return 'High health risk. Avoid all outdoor exertion and remain indoors with clean air filtration.'
    case 'child':
      return 'Avoid outdoor physical exertion. Keep children indoors with air purifiers active.'
    case 'elderly':
      return 'Avoid outdoor activity. Remain indoors with windows closed and air filtration running.'
    case 'outdoor-worker':
      return 'Hazardous conditions. Mandatory use of certified N95 respirators and reduced outdoor physical workload.'
    default:
      return 'Everyone may begin to experience health effects. Avoid prolonged or heavy outdoor exertion.'
  }
}

export default function LocationDetails() {
  const navigate = useNavigate()
  const { locationId } = useParams()
  const routerLocation = useLocation()
  const { t } = useLanguage()
  const { currentUser } = useAuth()

  // 1. Resolve location cleanly from user saved locations OR exploreResults
  const resolvedLocation = useMemo(() => {
    if (routerLocation.state?.location) {
      return routerLocation.state.location
    }
    const userSaved = loadUserSavedLocations(currentUser?.id)
    if (locationId) {
      const matchSaved = userSaved.find((loc) => String(loc.id) === String(locationId))
      if (matchSaved) return matchSaved
    }
    return null
  }, [locationId, routerLocation.state, currentUser?.id])

  const [airQuality, setAirQuality] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeProfile, setActiveProfile] = useState('general')
  const [lastUpdated, setLastUpdated] = useState('Just now')

  const loadData = useCallback(async (silent = false) => {
    if (!resolvedLocation) {
      setLoading(false)
      setError('Location information is missing or location has been removed.')
      return
    }

    const lat = Number(resolvedLocation.latitude)
    const lon = Number(resolvedLocation.longitude)

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setLoading(false)
      setError('Invalid coordinates for this location.')
      return
    }

    try {
      if (!silent) setLoading(true)
      setError('')

      const [aqData, weatherData] = await Promise.all([
        getAirQuality(lat, lon),
        getWeather(lat, lon),
      ])

      setAirQuality(aqData)
      setWeather(weatherData)

      const formattedTime = aqData.time
        ? new Date(aqData.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      setLastUpdated(formattedTime)
    } catch (err) {
      console.error('Location details fetch error:', err)
      setError('Live air quality data is currently unavailable.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [resolvedLocation])

  useEffect(() => {
    loadData()

    // Auto refresh every 15 minutes
    const interval = setInterval(() => {
      loadData(true)
    }, 15 * 60 * 1000)

    return () => clearInterval(interval)
  }, [loadData])

  // Handle missing location
  if (!resolvedLocation) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
          <MapPin size={32} />
        </div>
        <h1 className="font-display text-xl font-semibold text-ink-900">
          {t('common.locationNotFound', { defaultValue: 'Location not found' })}
        </h1>
        <p className="mt-2 text-sm text-ink-500 max-w-sm">
          {t('common.locationNotFoundDesc', { defaultValue: 'The requested saved location could not be loaded or has been deleted.' })}
        </p>
        <button
          type="button"
          onClick={() => navigate('/locations')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800 transition-colors"
        >
          <ArrowLeft size={16} />
          {t('common.backToMyLocations', { defaultValue: 'Back to My Locations' })}
        </button>
      </div>
    )
  }

  const band = airQuality ? getAqiBand(airQuality.aqi) : null
  const pollutantsList = airQuality ? formatPollutants(airQuality) : []

  return (
    <div className="page-enter flex flex-col gap-6 pb-12 sm:gap-8">

      {/* =====================================================
          TOP BAR & NAVIGATION
      ===================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/locations')}
          className="btn-premium inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-4 py-2.5 text-sm font-semibold text-ink-700 hover:border-forest-200 hover:text-forest-800 transition-colors"
        >
          <ArrowLeft size={16} />
          {t('common.backToMyLocations', { defaultValue: 'Back to My Locations' })}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData(false)}
            disabled={loading}
            className="btn-premium inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-4 py-2.5 text-sm font-semibold text-ink-700 hover:border-forest-200 hover:text-forest-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-forest-700' : ''} />
            {t('common.refresh', { defaultValue: 'Refresh' })}
          </button>
        </div>
      </div>

      {/* =====================================================
          LOCATION HEADER
      ===================================================== */}
      <div className="fade-down flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
            <MapPin size={12} className="text-forest-700" />
            {resolvedLocation.type || t('common.savedLocation', { defaultValue: 'Saved Location' })}
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-600 animate-pulse ml-1" />
            {t('common.live', { defaultValue: 'Live' })}
          </div>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            {resolvedLocation.name}
          </h1>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
            <span>
              {resolvedLocation.region}
              {resolvedLocation.country ? `, ${resolvedLocation.country}` : ''}
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-ink-300 sm:block" />

            <span className="inline-flex items-center gap-1.5 text-xs text-ink-400">
              <Clock size={13} />
              {t('common.lastUpdated', { defaultValue: 'Last updated' })}: {lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          LOADING STATE
      ===================================================== */}
      {loading && (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-ink-100 bg-surface p-8 shadow-card text-center">
          <Loader2 size={36} className="text-forest-700 animate-spin mb-3" />
          <p className="text-sm font-semibold text-ink-900">
            {t('common.loadingLiveData', { defaultValue: 'Fetching live air quality & weather data...' })}
          </p>
          <p className="text-xs text-ink-500 mt-1">
            {t('common.connectingApi', { defaultValue: 'Retrieving current measurements for' })} {resolvedLocation.name}
          </p>
        </div>
      )}

      {/* =====================================================
          ERROR STATE
      ===================================================== */}
      {!loading && error && (
        <div className="rounded-2xl border border-amber-200 bg-surface p-8 shadow-card text-center flex flex-col items-center justify-center min-h-[280px]">
          <AlertCircle size={40} className="text-amber-600 mb-3" />
          <h3 className="font-display text-lg font-semibold text-ink-900">
            {t('common.liveDataUnavailable', { defaultValue: 'Live air quality data is currently unavailable.' })}
          </h3>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-600">
            {error}
          </p>
          <button
            type="button"
            onClick={() => loadData(false)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-forest-800 transition-colors shadow-sm"
          >
            <RefreshCw size={14} />
            {t('common.tryAgain', { defaultValue: 'Try Again' })}
          </button>
        </div>
      )}

      {/* =====================================================
          LIVE CONTENT (HERO AQI, WEATHER, POLLUTANTS, GUIDANCE)
      ===================================================== */}
      {!loading && !error && airQuality && (
        <>
          {/* AQI HERO CARD */}
          <section className="scale-in">
            <AQICard location={{ ...resolvedLocation, aqi: airQuality.aqi, lastUpdated }} />
          </section>

          {/* ENVIRONMENTAL / WEATHER METRICS */}
          <section>
            <div className="fade-up mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
                {t('common.atmosphericConditions', { defaultValue: 'Atmospheric Conditions' })}
              </p>
              <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
                {t('common.weatherMetrics', { defaultValue: 'Live Weather & Environment' })}
              </h2>
            </div>

            <div className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Temperature */}
              <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  <Thermometer size={14} className="text-amber-500" />
                  {t('common.temperature', { defaultValue: 'Temperature' })}
                </div>
                <p className="mt-2 font-mono text-2xl font-bold text-ink-900">
                  {weather?.temperature !== null && weather?.temperature !== undefined
                    ? `${Math.round(weather.temperature)}°C`
                    : t('common.unavailable', { defaultValue: 'Data unavailable' })}
                </p>
                <p className="mt-1 text-[10px] text-ink-400">
                  {t('common.ambientTemp', { defaultValue: 'Current air temp' })}
                </p>
              </div>

              {/* Humidity */}
              <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  <Droplets size={14} className="text-blue-500" />
                  {t('common.humidity', { defaultValue: 'Humidity' })}
                </div>
                <p className="mt-2 font-mono text-2xl font-bold text-ink-900">
                  {weather?.humidity !== null && weather?.humidity !== undefined
                    ? `${Math.round(weather.humidity)}%`
                    : t('common.unavailable', { defaultValue: 'Data unavailable' })}
                </p>
                <p className="mt-1 text-[10px] text-ink-400">
                  {t('common.relativeHumidity', { defaultValue: 'Relative humidity' })}
                </p>
              </div>

              {/* Wind Speed */}
              <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  <Wind size={14} className="text-teal-500" />
                  {t('common.wind', { defaultValue: 'Wind' })}
                </div>
                <p className="mt-2 font-mono text-2xl font-bold text-ink-900">
                  {weather?.windSpeed !== null && weather?.windSpeed !== undefined
                    ? `${Math.round(weather.windSpeed)} km/h`
                    : t('common.unavailable', { defaultValue: 'Data unavailable' })}
                </p>
                <p className="mt-1 text-[10px] text-ink-400">
                  {t('common.windSpeed', { defaultValue: 'Wind speed (10m)' })}
                </p>
              </div>

              {/* Pressure */}
              <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  <Gauge size={14} className="text-indigo-500" />
                  {t('common.pressure', { defaultValue: 'Pressure' })}
                </div>
                <p className="mt-2 font-mono text-2xl font-bold text-ink-900">
                  {weather?.pressure !== null && weather?.pressure !== undefined
                    ? `${Math.round(weather.pressure)} hPa`
                    : t('common.unavailable', { defaultValue: 'Data unavailable' })}
                </p>
                <p className="mt-1 text-[10px] text-ink-400">
                  {t('common.surfacePressure', { defaultValue: 'Surface pressure' })}
                </p>
              </div>
            </div>
          </section>

          {/* POLLUTANT BREAKDOWN */}
          <section>
            <div className="fade-up mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
                  {t('common.detailedBreakdown', { defaultValue: 'Detailed Breakdown' })}
                </p>
                <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
                  {t('common.pollutantMetrics', { defaultValue: 'Pollutant Breakdown' })}
                </h2>
              </div>
              <span className="text-xs text-ink-400">
                {t('common.liveOpenMeteoData', { defaultValue: 'Open-Meteo API' })}
              </span>
            </div>

            <div className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
              {pollutantsList.map((pollutant) => (
                <PollutantCard key={pollutant.key} pollutant={pollutant} />
              ))}
            </div>
          </section>

          {/* TAILORED HEALTH GUIDANCE */}
          <section className="fade-up">
            <div className="rounded-2xl border border-forest-100 bg-surface p-6 shadow-soft sm:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-ink-100 pb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800 mb-2">
                      <ShieldCheck size={12} className="text-forest-700" />
                      {t('common.healthGuidanceTitle', { defaultValue: 'Personalized Risk Intelligence' })}
                    </div>
                    <h2 className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">
                      {t('common.tailoredHealthAdvice', { defaultValue: 'Health Advice by Sensitivity Profile' })}
                    </h2>
                  </div>

                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase"
                    style={{ backgroundColor: band.bg, color: band.color }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: band.color }} />
                    {band.label}
                  </span>
                </div>

                {/* Profile selection tabs */}
                <div className="flex flex-wrap gap-2">
                  {HEALTH_PROFILES.map((profile) => {
                    const ProfileIcon = profile.icon
                    const isActive = activeProfile === profile.key
                    return (
                      <button
                        key={profile.key}
                        type="button"
                        onClick={() => setActiveProfile(profile.key)}
                        className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-forest-700 text-white shadow-sm'
                            : 'bg-ink-50 text-ink-700 hover:bg-ink-100 hover:text-ink-900'
                        }`}
                      >
                        <ProfileIcon size={14} />
                        {t(profile.labelKey, { defaultValue: profile.defaultLabel })}
                      </button>
                    )
                  })}
                </div>

                {/* Guidance text card */}
                <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-800">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-forest-700 mb-1">
                        {t('common.recommendedAction', { defaultValue: 'Recommended Action' })}
                      </p>
                      <p className="text-sm leading-relaxed text-ink-800 sm:text-base">
                        {getHealthGuidance(airQuality.aqi, activeProfile)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informational Disclaimer */}
                <div className="flex items-start gap-2.5 rounded-lg bg-amber-50/60 border border-amber-100 p-3.5 text-xs text-amber-900">
                  <Info size={15} className="shrink-0 mt-0.5 text-amber-700" />
                  <span>
                    {t('common.disclaimerText', {
                      defaultValue: 'This guidance is based on general air quality standards (AQI) and environmental data. It does not constitute formal medical diagnosis or advice.',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* HISTORICAL / TREND CHART */}
          <section className="fade-up">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
                  {t('common.historicalContext', { defaultValue: 'Historical Context' })}
                </p>
                <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
                  {t('common.locationTrend', { defaultValue: 'Air Quality Trend' })}
                </h2>
              </div>
              <span className="text-[10px] font-medium text-ink-400 uppercase tracking-wider">
                {t('common.sampleHistoricalData', { defaultValue: 'Sample Trend Data' })}
              </span>
            </div>

            <TrendChart />
          </section>
        </>
      )}

    </div>
  )
}