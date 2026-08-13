import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Loader2,
  RefreshCw,
} from 'lucide-react'

import RiskBadge from '../components/RiskBadge'
import { getAirQuality } from '../data/airQualityApi'


export default function LocationDetails() {
  const navigate = useNavigate()
  const routerLocation = useLocation()

  const location = routerLocation.state?.location

  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =========================================================
  // GET LIVE AQI FOR SELECTED LOCATION
  // =========================================================

  const loadAirQuality = async () => {
    if (!location) {
      setLoading(false)
      setError('Location information is missing.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const latitude = Number(location.latitude)
      const longitude = Number(location.longitude)

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        throw new Error('Invalid location coordinates.')
      }

      const data = await getAirQuality(
        latitude,
        longitude
      )

      setAirQuality(data)
    } catch (err) {
      console.error(
        'Location details AQI error:',
        err
      )

      setError(
        'Unable to fetch live air quality for this location.'
      )
    } finally {
      setLoading(false)
    }
  }


  // =========================================================
  // LOAD WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    loadAirQuality()
  }, [])


  // =========================================================
  // LOCATION NOT FOUND
  // =========================================================

  if (!location) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <MapPin
            size={40}
            className="mx-auto mb-4 text-forest-600"
          />

          <h1 className="font-display text-xl font-semibold text-ink-900">
            Location not found
          </h1>

          <p className="mt-2 text-sm text-ink-500">
            Please search for a location again.
          </p>

          <button
            type="button"
            onClick={() => navigate('/locations')}
            className="mt-5 rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-800"
          >
            Back to My Locations
          </button>

        </div>

      </div>
    )
  }


  return (
    <div className="page-enter flex flex-col gap-6 pb-10 sm:gap-8">


      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="flex items-center justify-between">

        <button
          type="button"
          onClick={() => navigate('/locations')}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3.5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-forest-200 hover:text-forest-700"
        >
          <ArrowLeft size={16} />
          Back to My Locations
        </button>


        <button
          type="button"
          onClick={loadAirQuality}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3.5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-forest-200 hover:text-forest-700 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? 'animate-spin' : ''}
          />

          Refresh
        </button>

      </div>


      {/* =====================================================
          LOCATION HEADER
      ===================================================== */}

      <div>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">

          <MapPin size={12} />

          Live Location

        </div>


        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
          {location.name}
        </h1>


        <div className="mt-2 flex items-center gap-2 text-sm text-ink-500">

          <MapPin
            size={15}
            className="text-forest-600"
          />

          <span>
            {location.region}

            {location.country
              ? `, ${location.country}`
              : ''}
          </span>

        </div>

      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (

        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-ink-100 bg-surface shadow-soft">

          <div className="text-center">

            <Loader2
              size={32}
              className="mx-auto animate-spin text-forest-600"
            />

            <p className="mt-3 text-sm font-medium text-ink-700">
              Loading live air quality...
            </p>

            <p className="mt-1 text-xs text-ink-500">
              Getting the latest data for {location.name}
            </p>

          </div>

        </div>

      )}


      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && (

        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">

          <p className="font-semibold text-red-700">
            Unable to load air quality
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadAirQuality}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>

        </div>

      )}


      {/* =====================================================
          LIVE AIR QUALITY
      ===================================================== */}

      {!loading &&
        !error &&
        airQuality && (

          <>

            {/* MAIN AQI CARD */}

            <div className="rounded-2xl border border-ink-100 bg-surface p-6 shadow-soft sm:p-8">

              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">


                {/* AQI */}

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                    Current Air Quality
                  </p>


                  <div className="mt-3 flex items-end gap-4">

                    <p className="font-mono text-6xl font-bold tracking-tight text-ink-900">
                      {airQuality.aqi ?? '—'}
                    </p>


                    {airQuality.aqi !== null &&
                      airQuality.aqi !== undefined && (

                        <div className="mb-2">

                          <RiskBadge
                            aqi={airQuality.aqi}
                            size="sm"
                          />

                        </div>

                      )}

                  </div>


                  <p className="mt-3 text-sm text-ink-500">
                    Live AQI for {location.name}
                  </p>

                </div>


                {/* LIVE STATUS */}

                <div className="rounded-xl border border-forest-100 bg-forest-50 p-5 lg:min-w-[230px]">

                  <div className="flex items-center gap-2">

                    <span className="live-dot h-2 w-2 rounded-full bg-forest-600" />

                    <p className="text-sm font-semibold text-forest-800">
                      Live Monitoring
                    </p>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-forest-700">
                    Current air-quality data is being
                    retrieved from Open-Meteo.
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                POLLUTANTS
            ================================================= */}

            <div>

              <div className="mb-4">

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
                  Air Quality Data
                </p>

                <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">
                  Pollutant Breakdown
                </h2>

              </div>


              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">


                {/* PM2.5 */}

                <div className="rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">

                  <p className="text-[10px] uppercase tracking-wider text-ink-400">
                    PM2.5
                  </p>

                  <p className="mt-2 font-mono text-2xl font-bold text-ink-900">
                    {airQuality.pm25 ?? '—'}
                  </p>

                  <p className="mt-1 text-[10px] text-ink-400">
                    µg/m³
                  </p>

                </div>


                {/* PM10 */}

                <div className="rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">

                  <p className="text-[10px] uppercase tracking-wider text-ink-400">
                    PM10
                  </p>

                  <p className="mt-2 font-mono text-2xl font-bold text-ink-900">
                    {airQuality.pm10 ?? '—'}
                  </p>

                  <p className="mt-1 text-[10px] text-ink-400">
                    µg/m³
                  </p>

                </div>


                {/* NO2 */}

                <div className="rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">

                  <p className="text-[10px] uppercase tracking-wider text-ink-400">
                    NO₂
                  </p>

                  <p className="mt-2 font-mono text-2xl font-bold text-ink-900">
                    {airQuality.no2 ?? '—'}
                  </p>

                  <p className="mt-1 text-[10px] text-ink-400">
                    µg/m³
                  </p>

                </div>


                {/* O3 */}

                <div className="rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">

                  <p className="text-[10px] uppercase tracking-wider text-ink-400">
                    O₃
                  </p>

                  <p className="mt-2 font-mono text-2xl font-bold text-ink-900">
                    {airQuality.o3 ?? '—'}
                  </p>

                  <p className="mt-1 text-[10px] text-ink-400">
                    µg/m³
                  </p>

                </div>


                {/* SO2 */}

                <div className="rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">

                  <p className="text-[10px] uppercase tracking-wider text-ink-400">
                    SO₂
                  </p>

                  <p className="mt-2 font-mono text-2xl font-bold text-ink-900">
                    {airQuality.so2 ?? '—'}
                  </p>

                  <p className="mt-1 text-[10px] text-ink-400">
                    µg/m³
                  </p>

                </div>


                {/* CO */}

                <div className="rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">

                  <p className="text-[10px] uppercase tracking-wider text-ink-400">
                    CO
                  </p>

                  <p className="mt-2 font-mono text-2xl font-bold text-ink-900">
                    {airQuality.co ?? '—'}
                  </p>

                  <p className="mt-1 text-[10px] text-ink-400">
                    µg/m³
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                LOCATION INFO
            ================================================= */}

            <div className="rounded-xl border border-ink-100 bg-surface p-5 shadow-soft">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-700">

                  <MapPin size={18} />

                </div>


                <div>

                  <p className="font-semibold text-ink-900">
                    {location.name}
                  </p>

                  <p className="mt-1 text-sm text-ink-500">

                    {location.region}

                    {location.country
                      ? `, ${location.country}`
                      : ''}

                  </p>


                  <p className="mt-3 text-[10px] text-ink-400">
                    Coordinates: {location.latitude},{' '}
                    {location.longitude}
                  </p>

                </div>

              </div>

            </div>

          </>

        )}

    </div>
  )
}