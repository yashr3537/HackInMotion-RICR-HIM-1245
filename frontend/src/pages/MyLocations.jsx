import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Search,
  Loader2,
  Navigation,
} from 'lucide-react'

import SearchBar from '../components/SearchBar'
import RiskBadge from '../components/RiskBadge'
import { EmptyState } from '../components/EmptyState'

import { searchLocation } from '../data/locationApi'
import { getAirQuality } from '../data/airQualityApi'

const currentLocation = {
  name: 'Current location',
  region: 'Live air quality',
  aqi: null,
  pm25: null,
  pm10: null,
  no2: null,
  o3: null,
  so2: null,
  co: null,
}

export default function MyLocations() {
  const navigate = useNavigate()

  // =========================================================
  // CURRENT LOCATION
  // =========================================================

  const [currentLiveLocation, setCurrentLiveLocation] = useState({
    ...currentLocation,
    loading: true,
    error: null,
  })

  // =========================================================
  // SEARCH
  // =========================================================

  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  // =========================================================
  // CURRENT LOCATION AQI
  // =========================================================

  useEffect(() => {
    let cancelled = false

    const loadCurrentAQI = async (latitude, longitude) => {
      try {
        const airQuality = await getAirQuality(
          latitude,
          longitude
        )

        if (cancelled) return

        setCurrentLiveLocation((prev) => ({
          ...prev,
          latitude,
          longitude,
          aqi: airQuality.aqi,
          pm25: airQuality.pm25,
          pm10: airQuality.pm10,
          no2: airQuality.no2,
          o3: airQuality.o3,
          so2: airQuality.so2,
          co: airQuality.co,
          lastUpdated: 'Just now',
          loading: false,
          error: null,
        }))
      } catch (error) {
        console.error(
          'Current location AQI error:',
          error
        )

        if (!cancelled) {
          setCurrentLiveLocation((prev) => ({
            ...prev,
            loading: false,
            error:
              'Unable to fetch current air quality.',
          }))
        }
      }
    }

    if (!navigator.geolocation) {
      setCurrentLiveLocation((prev) => ({
        ...prev,
        loading: false,
        error:
          'Location is not supported by your browser.',
      }))

      return () => {
        cancelled = true
      }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return

        const { latitude, longitude } = position.coords

        loadCurrentAQI(
          latitude,
          longitude
        )
      },

      (error) => {
        console.error(
          'Current location error:',
          error
        )

        if (!cancelled) {
          setCurrentLiveLocation((prev) => ({
            ...prev,
            loading: false,
            error:
              'Location permission is required.',
          }))
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

  // =========================================================
  // SEARCH LOCATION + LIVE AQI
  // =========================================================

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setSearchResults([])
      setSearchError('')
      setSearchLoading(false)
      return
    }

    let cancelled = false

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)
        setSearchError('')
        setSearchResults([])

        // Search locations
        const locations =
          await searchLocation(trimmedQuery)

        if (cancelled) return

        if (
          !locations ||
          locations.length === 0
        ) {
          setSearchResults([])
          return
        }

        // Fetch live AQI
        const liveResults = []

        for (const location of locations) {
          if (cancelled) return

          try {
            const latitude =
              Number(location.latitude)

            const longitude =
              Number(location.longitude)

            if (
              !Number.isFinite(latitude) ||
              !Number.isFinite(longitude)
            ) {
              liveResults.push({
                ...location,
                aqi: null,
                pm25: null,
                pm10: null,
                no2: null,
                o3: null,
                so2: null,
                co: null,
              })

              continue
            }

            const airQuality =
              await getAirQuality(
                latitude,
                longitude
              )

            liveResults.push({
              ...location,

              latitude,
              longitude,

              aqi: airQuality.aqi,
              pm25: airQuality.pm25,
              pm10: airQuality.pm10,
              no2: airQuality.no2,
              o3: airQuality.o3,
              so2: airQuality.so2,
              co: airQuality.co,

              lastUpdated:
                airQuality.time || 'Just now',
            })
          } catch (aqiError) {
            console.error(
              `AQI error for ${location.name}:`,
              aqiError
            )

            liveResults.push({
              ...location,
              aqi: null,
              pm25: null,
              pm10: null,
              no2: null,
              o3: null,
              so2: null,
              co: null,
            })
          }
        }

        if (cancelled) return

        setSearchResults(liveResults)
      } catch (error) {
        console.error(
          'Location search error:',
          error
        )

        if (!cancelled) {
          setSearchResults([])
          setSearchError(
            'Unable to search locations right now.'
          )
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false)
        }
      }
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  // =========================================================
  // OPEN LOCATION DETAILS
  // =========================================================

  const handleViewDetails = (location) => {
    navigate('/location-details', {
      state: {
        location,
      },
    })
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="page-enter flex flex-col gap-8 pb-8 sm:gap-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="fade-down">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
            <MapPin size={12} />
            Location monitoring
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
            My Locations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
            Check your current location or search any
            city to see its live air quality.
          </p>
        </div>
      </section>


      {/* =====================================================
          CURRENT LOCATION
      ===================================================== */}

      <section>
        <div className="mb-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
            Your location
          </p>

          <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
            Current Location
          </h2>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-surface p-5 shadow-soft sm:p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* LOCATION */}

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                <Navigation size={20} />
              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h3 className="font-display text-lg font-semibold text-ink-900">
                    {currentLiveLocation.name}
                  </h3>

                  <span className="flex items-center gap-1 text-[10px] font-medium text-forest-600">
                    <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-600" />
                    Live
                  </span>

                </div>

                <p className="mt-1 text-sm text-ink-500">
                  {currentLiveLocation.region}
                </p>

              </div>

            </div>


            {/* AQI */}

            <div className="flex items-center gap-5">

              {currentLiveLocation.loading ? (

                <div className="flex items-center gap-2 text-sm text-ink-500">

                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Getting live AQI...

                </div>

              ) : currentLiveLocation.error ? (

                <p className="text-sm text-red-500">
                  {currentLiveLocation.error}
                </p>

              ) : (

                <>
                  <div className="text-right">

                    <p className="text-[10px] uppercase tracking-wider text-ink-400">
                      Current AQI
                    </p>

                    <p className="mt-1 font-mono text-3xl font-bold text-ink-900">
                      {currentLiveLocation.aqi ?? '—'}
                    </p>

                  </div>

                  {currentLiveLocation.aqi !== null &&
                    currentLiveLocation.aqi !== undefined && (
                      <RiskBadge
                        aqi={currentLiveLocation.aqi}
                        size="sm"
                      />
                    )}

                </>

              )}

            </div>

          </div>


          {/* CURRENT POLLUTANTS */}

          {!currentLiveLocation.loading &&
            !currentLiveLocation.error && (

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink-100 pt-5 sm:grid-cols-4">

                <div>
                  <p className="text-[10px] text-ink-400">
                    PM2.5
                  </p>

                  <p className="mt-1 font-mono text-sm font-semibold text-ink-800">
                    {currentLiveLocation.pm25 ?? '—'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-ink-400">
                    PM10
                  </p>

                  <p className="mt-1 font-mono text-sm font-semibold text-ink-800">
                    {currentLiveLocation.pm10 ?? '—'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-ink-400">
                    NO₂
                  </p>

                  <p className="mt-1 font-mono text-sm font-semibold text-ink-800">
                    {currentLiveLocation.no2 ?? '—'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-ink-400">
                    O₃
                  </p>

                  <p className="mt-1 font-mono text-sm font-semibold text-ink-800">
                    {currentLiveLocation.o3 ?? '—'}
                  </p>
                </div>

              </div>

            )}

        </div>
      </section>


      {/* =====================================================
          SEARCH LOCATION
      ===================================================== */}

      <section>

        <div className="mb-4">

          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
            Explore air quality
          </p>

          <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
            Search Location
          </h2>

          <p className="mt-1 text-xs text-ink-500">
            Search any city or region to check its current AQI.
          </p>

        </div>


        <div className="rounded-2xl border border-ink-100 bg-surface p-4 shadow-soft sm:p-5">

          {/* SEARCH BAR */}

          <div className="max-w-xl">

            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search city or region..."
            />

          </div>


          {/* LOADING */}

          {searchLoading && (

            <div className="mt-5 flex items-center gap-2 text-sm text-ink-500">

              <Loader2
                size={16}
                className="animate-spin"
              />

              Searching live air quality...

            </div>

          )}


          {/* ERROR */}

          {!searchLoading &&
            searchError && (

              <p className="mt-5 text-sm text-red-500">
                {searchError}
              </p>

            )}


          {/* RESULTS */}

          {!searchLoading &&
            !searchError &&
            searchResults.length > 0 && (

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {searchResults.map(
                  (location, index) => (

                    <div
                      key={`${location.id || location.name}-${location.latitude}-${location.longitude}-${index}`}
                      className="rounded-xl border border-ink-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-card"
                    >

                      {/* LOCATION */}

                      <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                          <MapPin size={16} />
                        </div>

                        <div className="min-w-0">

                          <p className="font-display font-semibold text-ink-900">
                            {location.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-ink-500">
                            {location.region}

                            {location.country
                              ? `, ${location.country}`
                              : ''}
                          </p>

                        </div>

                      </div>


                      {/* AQI */}

                      <div className="mt-4 flex items-end justify-between">

                        <div>

                          <p className="text-[10px] uppercase tracking-wider text-ink-400">
                            Current AQI
                          </p>

                          <p className="mt-1 font-mono text-2xl font-bold text-ink-900">
                            {location.aqi ?? '—'}
                          </p>

                        </div>

                        {location.aqi !== null &&
                          location.aqi !== undefined && (

                            <RiskBadge
                              aqi={location.aqi}
                              size="sm"
                            />

                          )}

                      </div>


                      {/* POLLUTANTS */}

                      <div className="mt-4 grid grid-cols-2 gap-2">

                        <div className="rounded-lg bg-ink-50 p-2">

                          <p className="text-[10px] text-ink-400">
                            PM2.5
                          </p>

                          <p className="mt-1 text-xs font-semibold text-ink-700">
                            {location.pm25 ?? '—'}
                          </p>

                        </div>


                        <div className="rounded-lg bg-ink-50 p-2">

                          <p className="text-[10px] text-ink-400">
                            PM10
                          </p>

                          <p className="mt-1 text-xs font-semibold text-ink-700">
                            {location.pm10 ?? '—'}
                          </p>

                        </div>

                      </div>


                      {/* VIEW DETAILS */}

                      <button
                        type="button"
                        onClick={() =>
                          handleViewDetails(location)
                        }
                        className="mt-4 w-full rounded-lg bg-forest-50 px-3 py-2.5 text-xs font-semibold text-forest-700 transition-colors hover:bg-forest-100"
                      >
                        View Live Details
                      </button>


                      {/* SOURCE */}

                      <p className="mt-3 text-center text-[9px] text-ink-400">
                        Live data from Open-Meteo
                      </p>

                    </div>

                  )
                )}

              </div>

            )}


          {/* NO RESULTS */}

          {!searchLoading &&
            !searchError &&
            query.trim() &&
            searchResults.length === 0 && (

              <div className="mt-5">

                <EmptyState
                  variant="location-not-found"
                  title="Location not found"
                  description={`We couldn't find a location matching "${query}". Try another city or region.`}
                />

              </div>

            )}


          {/* BEFORE SEARCH */}

          {!query.trim() &&
            !searchLoading && (

              <div className="mt-5 rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-6 text-center">

                <Search
                  size={24}
                  className="mx-auto text-forest-600"
                />

                <p className="mt-2 text-sm font-semibold text-ink-800">
                  Search for a location
                </p>

                <p className="mt-1 text-xs text-ink-500">
                  Enter a city name to see its live air quality.
                </p>

              </div>

            )}

        </div>

      </section>

    </div>
  )
}