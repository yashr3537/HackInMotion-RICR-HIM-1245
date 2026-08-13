import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Sparkles,
  Activity,
} from 'lucide-react'

import AQICard from '../components/AQICard'
import PollutantCard from '../components/PollutantCard'
import RecommendationCard from '../components/RecommendationCard'
import DominantPollutantCard from '../components/DominantPollutantCard'
import TrendChart from '../components/TrendChart'
import LocationCard from '../components/LocationCard'

import {
  currentLocation,
  pollutants,
  recommendation,
  dominantPollutant,
  savedLocations,
  alerts,
} from '../data/demoData'

import { useAuth } from '../auth'
import { getAirQuality } from '../data/airQualityApi'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [liveLocation, setLiveLocation] = useState(currentLocation)
  const [livePollutants, setLivePollutants] = useState(pollutants)
  const [loadingAQI, setLoadingAQI] = useState(true)
  const [aqiError, setAqiError] = useState(null)

  const { currentUser } = useAuth()

  const hour = new Date().getHours()

  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
        ? 'Good afternoon'
        : 'Good evening'

  const userName = currentUser?.name || 'there'

  // =========================================================
  // DASHBOARD ALWAYS USES CURRENT DEVICE LOCATION
  // =========================================================

  useEffect(() => {
    let cancelled = false

    const fetchLiveAQI = async (latitude, longitude) => {
      try {
        setLoadingAQI(true)
        setAqiError(null)

        const airQuality = await getAirQuality(
          latitude,
          longitude
        )

        if (cancelled) return

        // Update live AQI
        setLiveLocation((prev) => ({
          ...prev,

          aqi: airQuality.aqi,
          pm25: airQuality.pm25,
          pm10: airQuality.pm10,

          latitude,
          longitude,

          lastUpdated: 'Just now',
        }))

        // Update pollutant cards
        setLivePollutants((prev) =>
          prev.map((pollutant) => ({
            ...pollutant,

            value:
              pollutant.key === 'pm25'
                ? airQuality.pm25
                : pollutant.key === 'pm10'
                  ? airQuality.pm10
                  : pollutant.key === 'no2'
                    ? airQuality.no2
                    : pollutant.key === 'o3'
                      ? airQuality.o3
                      : pollutant.key === 'so2'
                        ? airQuality.so2
                        : pollutant.key === 'co'
                          ? airQuality.co
                          : pollutant.value,
          }))
        )

        setAqiError(null)
      } catch (error) {
        console.error('AQI error:', error)

        if (!cancelled) {
          setAqiError(
            'Unable to fetch live air quality.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingAQI(false)
        }
      }
    }

    // =======================================================
    // GET CURRENT DEVICE LOCATION
    // =======================================================

    if (!navigator.geolocation) {
      setAqiError(
        'Location is not supported by your browser.'
      )

      setLoadingAQI(false)

      return () => {
        cancelled = true
      }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return

        const {
          latitude,
          longitude,
        } = position.coords

        // Always fetch AQI using current device GPS
        fetchLiveAQI(
          latitude,
          longitude
        )
      },

      (error) => {
        console.error(
          'Location error:',
          error
        )

        if (!cancelled) {
          setAqiError(
            'Location permission is required for live AQI.'
          )

          setLoadingAQI(false)
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="page-enter flex flex-col gap-8 pb-8 sm:gap-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="fade-down">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">

              <Sparkles size={12} />

              Environmental overview

            </div>

            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">

              {greeting}, {userName}

            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-500">

              <span className="inline-flex items-center gap-1.5">

                <MapPin
                  size={14}
                  className="text-forest-600"
                />

                {liveLocation.name}
                {liveLocation.region
                  ? `, ${liveLocation.region}`
                  : ''}

              </span>

              <span className="hidden h-1 w-1 rounded-full bg-ink-300 sm:block" />

              <span className="inline-flex items-center gap-1.5">

                <Activity
                  size={13}
                  className="text-forest-600"
                />

                Live environmental data

              </span>

            </div>

            <div className="mt-2 text-xs">

              {loadingAQI && (
                <span className="text-ink-400">
                  Getting your live air quality...
                </span>
              )}

              {aqiError && (
                <span className="text-red-500">
                  {aqiError}
                </span>
              )}

              {!loadingAQI && !aqiError && (
                <span className="text-forest-600">
                  ✓ Live AQI updated
                </span>
              )}

            </div>

          </div>

          <div className="stagger-children flex flex-wrap gap-2.5">

            <Link
              to="/alerts"
              className="btn-premium inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink-700 hover:border-forest-200 hover:text-forest-800"
            >
              <BellRing size={15} />
              Alerts
            </Link>

            <Link
              to="/locations"
              className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800"
            >
              <MapPin size={15} />
              My Locations
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          CURRENT AIR QUALITY
      ===================================================== */}

      <section className="scale-in">

        <div className="relative">

          <div className="pointer-events-none absolute -inset-4 rounded-[28px] bg-forest-400/5 blur-3xl" />

          <div className="relative">

            <AQICard
              location={liveLocation}
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          QUICK CONTEXT
      ===================================================== */}

      <section className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">

        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">

          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">

            <ShieldCheck size={12} />

            Risk

          </div>

          <div className="mt-2 text-sm font-semibold text-ink-900">
            Personalised
          </div>

          <div className="mt-1 text-[10px] text-ink-500">
            Based on your profile
          </div>

        </div>


        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">

          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">

            <MapPin size={12} />

            Location

          </div>

          <div className="mt-2 truncate text-sm font-semibold text-ink-900">
            {liveLocation.name}
          </div>

          <div className="mt-1 text-[10px] text-ink-500">
            Current monitored area
          </div>

        </div>


        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">

          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">

            <CalendarDays size={12} />

            Tracking

          </div>

          <div className="mt-2 text-sm font-semibold text-ink-900">
            {savedLocations.length} locations
          </div>

          <div className="mt-1 text-[10px] text-ink-500">
            Saved for monitoring
          </div>

        </div>


        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">

          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">

            <BellRing size={12} />

            Alerts

          </div>

          <div className="mt-2 text-sm font-semibold text-ink-900">

            {Array.isArray(alerts)
              ? alerts.filter(
                  (alert) => !alert.read
                ).length
              : 0}{' '}
            unread

          </div>

          <div className="mt-1 text-[10px] text-ink-500">
            Environmental notifications
          </div>

        </div>

      </section>


      {/* =====================================================
          POLLUTANT BREAKDOWN
      ===================================================== */}

      <section>

        <div className="fade-up mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
              Environmental metrics
            </p>

            <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
              Pollutant Breakdown
            </h2>

          </div>

          <p className="text-xs text-ink-500">
            Current readings for {liveLocation.name}
          </p>

        </div>

        <div className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">

          {livePollutants.map((pollutant) => (

            <PollutantCard
              key={pollutant.key}
              pollutant={pollutant}
            />

          ))}

        </div>

      </section>


      {/* =====================================================
          RECOMMENDATION + DOMINANT POLLUTANT
      ===================================================== */}

      <section className="grid gap-5 sm:gap-6 lg:grid-cols-5">

        <div className="fade-left lg:col-span-3">

          <RecommendationCard
            recommendation={recommendation}
          />

        </div>

        <div
          className="fade-right lg:col-span-2"
          style={{ animationDelay: '120ms' }}
        >

          <DominantPollutantCard
            data={dominantPollutant}
          />

        </div>

      </section>


      {/* =====================================================
          HISTORICAL TREND
      ===================================================== */}

      <section className="fade-up">

        <div className="mb-4 flex items-end justify-between gap-4">

          <div>

            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
              Historical context
            </p>

            <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
              How your air is changing
            </h2>

          </div>

          <Link
            to="/history"
            className="group hidden items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800 sm:flex"
          >

            Full history

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
      ===================================================== */}

      <section>

        <div className="fade-up mb-4 flex items-end justify-between gap-4">

          <div>

            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
              Places that matter
            </p>

            <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
              My Locations
            </h2>

          </div>

          <Link
            to="/locations"
            className="group inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800"
          >

            View all

            <ArrowRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />

          </Link>

        </div>

        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {savedLocations.map((location) => (

            <LocationCard
              key={location.id}
              location={location}
            />

          ))}

        </div>

      </section>


      {/* =====================================================
          ALERT PREVIEW
      ===================================================== */}

      {Array.isArray(alerts) && alerts.length > 0 && (

        <section className="fade-up">

          <div className="mb-4 flex items-end justify-between gap-4">

            <div>

              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
                Stay informed
              </p>

              <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
                Recent Alerts
              </h2>

            </div>

            <Link
              to="/alerts"
              className="group inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800"
            >

              View alerts

              <ArrowRight
                size={13}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />

            </Link>

          </div>

          <div className="stagger-children space-y-3">

            {alerts.slice(0, 3).map((alert) => (

              <div
                key={alert.id}
                className="card-hover rounded-xl"
              >

                <div className="rounded-xl border border-ink-100 bg-surface">

                  <div className="flex items-start gap-3 p-4">

                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-forest-600" />

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center justify-between gap-2">

                        <p className="text-sm font-semibold text-ink-900">
                          {alert.title}
                        </p>

                        <span className="text-[10px] text-ink-400">
                          {alert.time}
                        </span>

                      </div>

                      <p className="mt-1 text-xs leading-5 text-ink-600">
                        {alert.message}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-ink-400">

                        <span>
                          {alert.location}
                        </span>

                        {alert.aqi !== undefined && (

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
      ===================================================== */}

      <section className="fade-up">

        <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-6 sm:p-7">

          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-forest-400/10 blur-3xl float-soft" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-forest-700">

                <ShieldCheck size={13} />

                Keep your environment close

              </div>

              <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">

                Want to explore another location?

              </h3>

              <p className="mt-1 text-sm leading-6 text-ink-600">

                Search a new area, compare locations, or plan a lower-exposure activity.

              </p>

            </div>

            <div className="flex flex-wrap gap-2.5">

              <Link
                to="/locations"
                className="btn-premium inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-xs font-semibold text-forest-800 hover:bg-forest-50"
              >

                Explore locations

                <ArrowRight size={14} />

              </Link>

              <Link
                to="/activity"
                className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-forest-800"
              >

                Check activity risk

                <Activity size={14} />

              </Link>

            </div>

          </div>

        </div>

      </section>

    </div>
  )
}