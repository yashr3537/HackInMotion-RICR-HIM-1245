import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Search,
  Loader2,
  Navigation,
  Trash2,
  Plus,
  Star,
  Check,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react'

import SearchBar from '../components/SearchBar'
import RiskBadge from '../components/RiskBadge'
import LocationCard from '../components/LocationCard'
import { EmptyState } from '../components/EmptyState'

import { searchLocation, reverseGeocode } from '../data/locationApi'
import { getAirQuality } from '../data/airQualityApi'
import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'
import {
  loadUserSavedLocations,
  removeUserSavedLocation,
  addUserSavedLocation,
} from '../data/savedLocationsStore'

export default function MyLocations() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { t } = useLanguage()

  // =========================================================
  // SAVED LOCATIONS PERSISTENT STATE
  // =========================================================

  const [mySavedLocations, setMySavedLocations] = useState([])
  const [removingLocation, setRemovingLocation] = useState(null)

  useEffect(() => {
    const loaded = loadUserSavedLocations(currentUser?.id)
    setMySavedLocations(loaded)
  }, [currentUser?.id])

  const handleRemoveRequest = (target) => {
    if (!target) return
    const updated = removeUserSavedLocation(target, currentUser?.id)
    setMySavedLocations(updated)
    setRemovingLocation(null)
  }

  const handleSaveLocation = (loc) => {
    const updated = addUserSavedLocation(loc, currentUser?.id)
    setMySavedLocations(updated)
  }

  const isLocationSaved = (loc) => {
    return mySavedLocations.some(
      (saved) =>
        String(saved.id) === String(loc.id) ||
        (saved.name.toLowerCase() === loc.name.toLowerCase() && saved.region === loc.region)
    )
  }

  // =========================================================
  // CURRENT LOCATION
  // =========================================================

  const [currentLiveLocation, setCurrentLiveLocation] = useState({
    name: 'Detecting location...',
    region: '',
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
        const [geo, airQuality] = await Promise.all([
          reverseGeocode(latitude, longitude),
          getAirQuality(latitude, longitude),
        ])

        if (cancelled) return

        setCurrentLiveLocation({
          name: geo.name || 'Current location',
          region: geo.region || '',
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
        })
      } catch (error) {
        console.error('Current location AQI error:', error)
        if (!cancelled) {
          setCurrentLiveLocation((prev) => ({
            ...prev,
            loading: false,
            error: t('common.unableFetchAQI', { defaultValue: 'Unable to fetch current air quality.' }),
          }))
        }
      }
    }

    if (!navigator.geolocation) {
      setCurrentLiveLocation((prev) => ({
        ...prev,
        loading: false,
        error: t('common.geoNotSupported', { defaultValue: 'Location is not supported by your browser.' }),
      }))
      return () => {
        cancelled = true
      }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return
        const { latitude, longitude } = position.coords
        loadCurrentAQI(latitude, longitude)
      },
      (error) => {
        console.warn('Current location error, using default fallback:', error)
        if (!cancelled) {
          loadCurrentAQI(23.2599, 77.4126) // Fallback to Bhopal if denied
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000,
      }
    )

    return () => {
      cancelled = true
    }
  }, [t])

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

        const locations = await searchLocation(trimmedQuery)

        if (cancelled) return

        if (!locations || locations.length === 0) {
          setSearchResults([])
          return
        }

        const liveResults = []

        for (const location of locations) {
          if (cancelled) return

          try {
            const latitude = Number(location.latitude)
            const longitude = Number(location.longitude)

            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
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

            const airQuality = await getAirQuality(latitude, longitude)

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
              lastUpdated: airQuality.time || 'Just now',
            })
          } catch (aqiError) {
            console.error(`AQI error for ${location.name}:`, aqiError)
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
        console.error('Location search error:', error)
        if (!cancelled) {
          setSearchResults([])
          setSearchError(t('common.unableSearch', { defaultValue: 'Unable to search locations right now.' }))
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false)
        }
      }
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, t])

  const handleViewDetails = (location) => {
    navigate(`/locations/${location.id}`, {
      state: {
        location,
      },
    })
  }

  return (
    <div className="page-enter flex flex-col gap-8 pb-8 sm:gap-10">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <section className="fade-down">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
            <MapPin size={12} />
            {t('common.locationMonitoring', { defaultValue: 'Location monitoring' })}
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
            {t('common.myLocations', { defaultValue: 'My Locations' })}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
            {t('common.myLocationsDesc', {
              defaultValue: 'Monitor live air quality for your saved locations or search any city worldwide.',
            })}
          </p>
        </div>
      </section>

      {/* =====================================================
          SAVED LOCATIONS SECTION
      ===================================================== */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
              {t('common.savedPlaces', { defaultValue: 'Saved places' })}
            </p>
            <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
              {t('common.savedLocations', { defaultValue: 'Saved Locations' })} ({mySavedLocations.length})
            </h2>
          </div>
        </div>

        {mySavedLocations.length > 0 ? (
          <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mySavedLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onRemove={(target) => handleRemoveRequest(target)}
                onViewDetails={(loc) => handleViewDetails(loc)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-ink-100 bg-surface p-6 shadow-soft text-center">
            <EmptyState
              variant="no-saved-locations"
              title={t('common.noSavedLocations', { defaultValue: 'No saved locations' })}
              description={t('common.noSavedLocationsDesc', {
                defaultValue: "You haven't saved any locations yet. Use search below to explore and save cities.",
              })}
            />
          </div>
        )}
      </section>

      {/* =====================================================
          CURRENT LOCATION
      ===================================================== */}
      <section>
        <div className="mb-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
            {t('common.yourLocation', { defaultValue: 'Your location' })}
          </p>
          <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
            {t('common.currentDeviceLocation', { defaultValue: 'Current Location' })}
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
                    <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-600 animate-pulse" />
                    {t('common.live', { defaultValue: 'Live' })}
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
                  <Loader2 size={17} className="animate-spin text-forest-700" />
                  {t('common.gettingAQI', { defaultValue: 'Getting live AQI...' })}
                </div>
              ) : currentLiveLocation.error ? (
                <p className="text-sm text-red-500">{currentLiveLocation.error}</p>
              ) : (
                <>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-ink-400">
                      {t('common.currentAQI', { defaultValue: 'Current AQI' })}
                    </p>
                    <p className="font-mono text-2xl font-bold text-ink-900">
                      {currentLiveLocation.aqi ?? '—'}
                    </p>
                  </div>
                  {currentLiveLocation.aqi !== null && (
                    <RiskBadge aqi={currentLiveLocation.aqi} size="sm" />
                  )}
                </>
              )}
            </div>
          </div>

          {/* CURRENT POLLUTANTS */}
          {!currentLiveLocation.loading && !currentLiveLocation.error && (
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink-100 pt-5 sm:grid-cols-4">
              <div>
                <p className="text-[10px] text-ink-400">PM2.5</p>
                <p className="mt-1 font-mono text-sm font-semibold text-ink-800">
                  {currentLiveLocation.pm25 ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-ink-400">PM10</p>
                <p className="mt-1 font-mono text-sm font-semibold text-ink-800">
                  {currentLiveLocation.pm10 ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-ink-400">NO₂</p>
                <p className="mt-1 font-mono text-sm font-semibold text-ink-800">
                  {currentLiveLocation.no2 ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-ink-400">O₃</p>
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
            {t('common.exploreAirQuality', { defaultValue: 'Explore air quality' })}
          </p>
          <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
            {t('common.searchLocation', { defaultValue: 'Search Location' })}
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            {t('common.searchLocationDesc', { defaultValue: 'Search any city or region to check its current AQI and save it.' })}
          </p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-surface p-4 shadow-soft sm:p-5">
          {/* SEARCH BAR */}
          <div className="max-w-xl">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={t('common.searchPlaceholder', { defaultValue: 'Search city or region...' })}
            />
          </div>

          {/* LOADING */}
          {searchLoading && (
            <div className="mt-5 flex items-center gap-2 text-sm text-ink-500">
              <Loader2 size={16} className="animate-spin text-forest-700" />
              {t('common.searchingAQI', { defaultValue: 'Searching live air quality...' })}
            </div>
          )}

          {/* ERROR */}
          {!searchLoading && searchError && (
            <p className="mt-5 text-sm text-red-500">{searchError}</p>
          )}

          {/* RESULTS */}
          {!searchLoading && !searchError && searchResults.length > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((location, index) => {
                const saved = isLocationSaved(location)
                return (
                  <div
                    key={`${location.id || location.name}-${location.latitude}-${location.longitude}-${index}`}
                    className="rounded-xl border border-ink-100 bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-card flex flex-col justify-between"
                  >
                    {/* LOCATION */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                            <MapPin size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-display font-semibold text-ink-900">{location.name}</p>
                            <p className="mt-0.5 truncate text-xs text-ink-500">
                              {location.region}
                              {location.country ? `, ${location.country}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* SAVE BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleSaveLocation(location)}
                          disabled={saved}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                            saved
                              ? 'bg-forest-50 text-forest-800 cursor-default'
                              : 'bg-forest-700 text-white hover:bg-forest-800 shadow-sm'
                          }`}
                        >
                          {saved ? (
                            <>
                              <Check size={13} />
                              {t('common.saved', { defaultValue: 'Saved' })}
                            </>
                          ) : (
                            <>
                              <Plus size={13} />
                              {t('common.addLocation', { defaultValue: 'Save' })}
                            </>
                          )}
                        </button>
                      </div>

                      {/* AQI */}
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-ink-400">
                            {t('common.currentAQI', { defaultValue: 'Current AQI' })}
                          </p>
                          <p className="font-mono text-2xl font-bold text-ink-900">
                            {location.aqi ?? '—'}
                          </p>
                        </div>
                        {location.aqi !== null && (
                          <RiskBadge aqi={location.aqi} size="sm" />
                        )}
                      </div>
                    </div>

                    {/* VIEW DETAILS */}
                    <button
                      type="button"
                      onClick={() => handleViewDetails(location)}
                      className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-forest-50 px-3 py-2.5 text-xs font-semibold text-forest-700 transition-colors hover:bg-forest-100"
                    >
                      {t('common.viewLiveDetails', { defaultValue: 'View Live Details' })}
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* NO RESULTS */}
          {!searchLoading && !searchError && query.trim() && searchResults.length === 0 && (
            <div className="mt-5">
              <EmptyState
                variant="location-not-found"
                title={t('common.noLocationFoundTitle', { defaultValue: 'Location not found' })}
                description={t('common.noLocationFoundDesc', {
                  defaultValue: `We couldn't find a location matching "${query}". Try another city or region.`,
                })}
              />
            </div>
          )}

          {/* BEFORE SEARCH */}
          {!query.trim() && !searchLoading && (
            <div className="mt-5 rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-6 text-center">
              <Search size={24} className="mx-auto text-forest-600 mb-2" />
              <p className="text-sm font-semibold text-ink-800">
                {t('common.searchPromptTitle', { defaultValue: 'Search for a location' })}
              </p>
              <p className="mt-1 text-xs text-ink-500">
                {t('common.searchPromptDesc', { defaultValue: 'Enter a city name to see its live air quality.' })}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}
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

    </div>
  )
}