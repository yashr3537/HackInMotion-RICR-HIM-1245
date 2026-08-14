import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Sparkles,
  Activity,
  RefreshCw,
  Navigation,
  Loader2,
  Trash2,
  AlertOctagon,
} from 'lucide-react'

import AQICard from '../components/AQICard'
import PollutantCard from '../components/PollutantCard'
import RecommendationCard from '../components/RecommendationCard'
import DominantPollutantCard from '../components/DominantPollutantCard'
import TrendChart from '../components/TrendChart'
import LocationCard from '../components/LocationCard'
import {
  fetchUserAlerts,
  recordAirQualitySnapshot,
  fetchSavedLocations,
  removeSavedLocationFromDb,
  updateSavedLocationThreshold,
} from '../services/supabase/supabaseService'
import { Sliders } from 'lucide-react'

import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'
import { useLiveAirQuality } from '../hooks/useLiveAirQuality'
import { formatPollutants, getDominantPollutant, getRecommendationForAqi } from '../data/aqiUtils'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const { loading, error, data: liveLocation, refetch } = useLiveAirQuality()

  const [userSavedLocations, setUserSavedLocations] = useState([])
  const [alerts, setAlerts] = useState([])
  const [removingLocation, setRemovingLocation] = useState(null)
  const [editingThresholdLocation, setEditingThresholdLocation] = useState(null)
  const [editingThresholdValue, setEditingThresholdValue] = useState(100)

  useEffect(() => {
    if (!currentUser?.id) {
      setUserSavedLocations([])
      return
    }

    let isMounted = true
    fetchSavedLocations(currentUser.id)
      .then((locations) => {
        if (isMounted) setUserSavedLocations(locations)
      })
      .catch((err) => {
        console.error('Error fetching saved locations in Dashboard:', err)
      })

    return () => {
      isMounted = false
    }
  }, [currentUser?.id])

  useEffect(() => {
    let isMounted = true
    async function loadAlerts() {
      if (currentUser?.id) {
        const dbAlerts = await fetchUserAlerts(currentUser.id)
        if (isMounted) setAlerts(dbAlerts)
      } else {
        if (isMounted) setAlerts([])
      }
    }
    loadAlerts()
    return () => {
      isMounted = false
    }
  }, [currentUser?.id])

  // Record snapshot when liveLocation is loaded
  useEffect(() => {
    if (liveLocation && liveLocation.aqi !== null) {
      recordAirQualitySnapshot(currentUser?.id, liveLocation, liveLocation)
    }
  }, [liveLocation, currentUser?.id])

  const handleRemoveRequest = (target) => {
    if (!target) return
    setRemovingLocation(target)
  }

  const handleConfirmRemove = async () => {
    if (!removingLocation || !currentUser?.id) return
    const targetId = removingLocation.id
    try {
      const success = await removeSavedLocationFromDb(currentUser.id, targetId)
      if (success) {
        setUserSavedLocations((prev) => prev.filter((loc) => loc.id !== targetId))
      }
    } catch (err) {
      console.error('Error removing location in Dashboard:', err)
    } finally {
      setRemovingLocation(null)
    }
  }

  const handleEditThresholdRequest = (loc) => {
    setEditingThresholdLocation(loc)
    setEditingThresholdValue(loc.alertThreshold || 100)
  }

  const confirmUpdateThreshold = async () => {
    if (!editingThresholdLocation || !currentUser?.id) return
    const targetId = editingThresholdLocation.id
    try {
      const success = await updateSavedLocationThreshold(
        currentUser.id,
        targetId,
        editingThresholdValue
      )
      if (success) {
        setUserSavedLocations((prev) =>
          prev.map((loc) =>
            loc.id === targetId ? { ...loc, alertThreshold: editingThresholdValue } : loc
          )
        )
      }
    } catch (err) {
      console.error('Failed to update threshold in Dashboard:', err)
    } finally {
      setEditingThresholdLocation(null)
    }
  }

  const hour = new Date().getHours()

  const greeting =
    hour < 12
      ? t('dashboard.greetingMorning')
      : hour < 18
        ? t('dashboard.greetingAfternoon')
        : t('dashboard.greetingEvening')

  const userName = currentUser?.name || 'there'

  const livePollutants = liveLocation ? formatPollutants(liveLocation) : []
  const liveDominantPollutant = getDominantPollutant(livePollutants)
  const liveRecommendation = getRecommendationForAqi(liveLocation?.aqi)

  const handleResetToCurrentLocation = () => {
    localStorage.removeItem('selectedAirGuardLocation')
    refetch()
  }

  return (
    <div className="page-enter flex flex-col gap-8 pb-8 sm:gap-10">
      {/* =====================================================
          HEADER
      ====================================================== */}
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
              <span className="inline-flex items-center gap-1.5 font-medium text-ink-900">
                <MapPin size={14} className="text-forest-600" />
                {loading
                  ? 'Detecting location...'
                  : liveLocation
                    ? `${liveLocation.name}${liveLocation.region ? ', ' + liveLocation.region : ''}`
                    : 'Location unavailable'}
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-ink-300 sm:block" />

              <span className="inline-flex items-center gap-1.5">
                <Activity size={13} className="text-forest-600" />
                {t('dashboard.liveEnvironmentalData')}
              </span>
            </div>
          </div>

          <div className="stagger-children flex flex-wrap gap-2.5 items-center">
            {localStorage.getItem('selectedAirGuardLocation') && (
              <button
                type="button"
                onClick={handleResetToCurrentLocation}
                className="btn-premium inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-3.5 py-2.5 text-sm font-semibold text-forest-800 hover:bg-forest-100"
                title="Use my device current location"
              >
                <Navigation size={15} />
                My Location
              </button>
            )}

            <button
              type="button"
              onClick={refetch}
              disabled={loading}
              className="btn-premium inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink-700 hover:border-forest-200 hover:text-forest-800 disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            <Link
              to="/alerts"
              className="btn-premium inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink-700 hover:border-forest-200 hover:text-forest-800"
            >
              <BellRing size={15} />
              {t('nav.alerts')}
            </Link>

            <Link
              to="/report"
              className="btn-premium inline-flex items-center gap-2 rounded-xl bg-amber-600 dark:bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 dark:hover:bg-amber-800"
            >
              <AlertOctagon size={15} />
              {t('nav.reportIssue')}
            </Link>

            <Link
              to="/locations"
              className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800"
            >
              <MapPin size={15} />
              {t('nav.locations')}
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          CURRENT AIR QUALITY HERO
      ====================================================== */}
      <section className="scale-in">
        <div className="relative">
          <div className="pointer-events-none absolute -inset-4 rounded-[28px] bg-forest-400/5 blur-3xl" />

          <div className="relative">
            <AQICard location={liveLocation} loading={loading} error={error} onRetry={refetch} />
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK CONTEXT
      ====================================================== */}
      <section className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            <ShieldCheck size={12} />
            {t('dashboard.riskLabel')}
          </div>

          <div className="mt-2 text-sm font-semibold text-ink-900">
            {t('dashboard.personalised')}
          </div>

          <div className="mt-1 text-[10px] text-ink-500">{t('dashboard.basedOnProfile')}</div>
        </div>

        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            <MapPin size={12} />
            {t('dashboard.locationLabel')}
          </div>

          <div className="mt-2 truncate text-sm font-semibold text-ink-900">
            {loading ? 'Detecting...' : liveLocation ? liveLocation.name : 'Unavailable'}
          </div>

          <div className="mt-1 text-[10px] text-ink-500">{t('dashboard.primaryMonitoredArea')}</div>
        </div>

        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            <CalendarDays size={12} />
            {t('dashboard.tracking')}
          </div>

          <div className="mt-2 text-sm font-semibold text-ink-900">
            {userSavedLocations.length} {t('dashboard.locations')}
          </div>

          <div className="mt-1 text-[10px] text-ink-500">{t('dashboard.savedForMonitoring')}</div>
        </div>

        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            <BellRing size={12} />
            {t('nav.alerts')}
          </div>

          <div className="mt-2 text-sm font-semibold text-ink-900">
            {Array.isArray(alerts)
              ? t('dashboard.unread', { count: alerts.filter((alert) => !alert.read).length })
              : t('dashboard.unread', { count: 0 })}
          </div>

          <div className="mt-1 text-[10px] text-ink-500">
            {t('dashboard.environmentalNotifications')}
          </div>
        </div>
      </section>

      {/* =====================================================
          POLLUTANT BREAKDOWN
      ====================================================== */}
      <section>
        <div className="fade-up mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
              {t('dashboard.environmentalMetrics')}
            </p>

            <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
              {t('dashboard.pollutantBreakdown')}
            </h2>
          </div>

          <p className="text-xs text-ink-500">
            {liveLocation
              ? t('dashboard.currentReadingsFor', { location: liveLocation.name })
              : 'Current readings'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-40 rounded-xl border border-ink-100 bg-surface p-4 flex flex-col items-center justify-center animate-pulse"
              >
                <Loader2 size={20} className="text-forest-600 animate-spin mb-2" />
                <span className="text-xs text-ink-400">Loading...</span>
              </div>
            ))}
          </div>
        ) : error || !liveLocation ? (
          <div className="rounded-xl border border-amber-200 bg-surface p-6 text-center text-xs text-amber-700">
            Live pollutant readings are currently unavailable.
          </div>
        ) : (
          <div className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
            {livePollutants.map((pollutant) => (
              <PollutantCard key={pollutant.key} pollutant={pollutant} />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          PERSONAL RECOMMENDATION + DOMINANT POLLUTANT
      ====================================================== */}
      <section className="grid gap-5 sm:gap-6 lg:grid-cols-5">
        <div className="fade-left lg:col-span-3">
          <RecommendationCard recommendation={liveRecommendation} />
        </div>

        <div className="fade-right lg:col-span-2" style={{ animationDelay: '120ms' }}>
          <DominantPollutantCard data={liveDominantPollutant} />
        </div>
      </section>

      {/* =====================================================
          HISTORICAL TREND
      ====================================================== */}
      <section className="fade-up">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
              {t('dashboard.historicalContext')}
            </p>

            <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
              {t('dashboard.howAirIsChanging')}
            </h2>
          </div>

          <Link
            to="/history"
            className="group hidden items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800 sm:flex"
          >
            {t('dashboard.fullHistory')}
            <ArrowRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <TrendChart />
      </section>

      {/* =====================================================
          MY LOCATIONS
      ====================================================== */}
      <section>
        <div className="fade-up mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
              {t('dashboard.placesThatMatter')}
            </p>

            <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
              {t('dashboard.myLocations')}
            </h2>
          </div>

          <Link
            to="/locations"
            className="group inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800"
          >
            {t('dashboard.viewAll')}
            <ArrowRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userSavedLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onRemove={(target) => handleRemoveRequest(target)}
              onEditThreshold={(loc) => handleEditThresholdRequest(loc)}
            />
          ))}
        </div>
      </section>

      {/* DELETE CONFIRMATION MODAL */}
      {removingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md scale-in rounded-2xl border border-ink-100 bg-surface p-6 shadow-card"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="font-display text-lg font-semibold text-ink-900">
              {t('common.removeLocationTitle', { defaultValue: 'Remove Location' })}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              {t('common.removeLocationConfirm', {
                defaultValue: `Are you sure you want to remove "${removingLocation.name}" from your saved locations?`,
                name: removingLocation.name,
              })}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRemovingLocation(null)}
                className="rounded-xl border border-ink-200 bg-surface px-4 py-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 transition-colors"
              >
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </button>

              <button
                type="button"
                onClick={handleConfirmRemove}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                {t('common.remove', { defaultValue: 'Remove Location' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EXISTING LOCATION THRESHOLD MODAL */}
      {editingThresholdLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md scale-in rounded-2xl border border-ink-100 bg-surface p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Sliders size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-900">
                  Edit Alert Threshold
                </h3>
                <p className="text-xs text-ink-500">{editingThresholdLocation.name}</p>
              </div>
            </div>

            <p className="text-xs text-ink-600 leading-relaxed mb-4">
              Update your trigger AQI for voice &amp; push notifications for{' '}
              {editingThresholdLocation.name}.
            </p>

            <div className="space-y-4 rounded-xl border border-ink-100 bg-ink-50/50 p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink-700">Trigger AQI Threshold:</label>
                <span className="font-mono text-base font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  {editingThresholdValue} AQI
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={editingThresholdValue}
                onChange={(e) => setEditingThresholdValue(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />

              <div className="flex gap-2 pt-1">
                {[10, 50, 100, 150, 200].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEditingThresholdValue(preset)}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-md border transition-all ${
                      editingThresholdValue === preset
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-surface text-ink-700 border-ink-200 hover:bg-ink-100'
                    }`}
                  >
                    {preset === 10 ? '10 (Test)' : preset}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-ink-400 text-center">
                * Select 10 for instant testing of voice alerts when live AQI &gt; 10.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingThresholdLocation(null)}
                className="rounded-xl border border-ink-200 bg-surface px-4 py-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmUpdateThreshold}
                className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors"
              >
                Update Threshold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ALERT PREVIEW
      ====================================================== */}
      {Array.isArray(alerts) && alerts.length > 0 && (
        <section className="fade-up">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
                {t('dashboard.stayInformed')}
              </p>

              <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
                {t('dashboard.recentAlerts')}
              </h2>
            </div>

            <Link
              to="/alerts"
              className="group inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800"
            >
              {t('dashboard.viewAlerts')}
              <ArrowRight
                size={13}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="stagger-children space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="card-hover rounded-xl">
                <div className="rounded-xl border border-ink-100 bg-surface">
                  <div className="flex items-start gap-3 p-4">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-forest-600" />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink-900">{alert.title}</p>

                        <span className="text-[10px] text-ink-400">{alert.time}</span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-ink-600">{alert.message}</p>

                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-ink-400">
                        <span>{alert.location}</span>

                        {alert.aqi !== undefined && alert.aqi !== null && (
                          <span className="font-mono font-semibold text-ink-600">
                            AQI {alert.aqi}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          BOTTOM ACTION
      ====================================================== */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-forest-400/10 blur-3xl float-soft" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-forest-700">
                <ShieldCheck size={13} />
                {t('dashboard.keepYourEnvironmentClose')}
              </div>

              <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">
                {t('dashboard.exploreAnotherLocationQuestion')}
              </h3>

              <p className="mt-1 text-sm leading-6 text-ink-600">{t('dashboard.searchNewArea')}</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/locations"
                className="btn-premium inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-xs font-semibold text-forest-800 hover:bg-forest-50"
              >
                {t('dashboard.exploreLocations')}
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/activity"
                className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-forest-800"
              >
                {t('dashboard.checkActivityRisk')}
                <Activity size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
