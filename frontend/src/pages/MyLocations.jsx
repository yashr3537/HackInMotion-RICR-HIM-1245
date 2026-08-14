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
  BellRing,
  Sliders,
} from 'lucide-react'

import SearchBar from '../components/SearchBar'
import RiskBadge from '../components/RiskBadge'
import LocationCard from '../components/LocationCard'
import { EmptyState } from '../components/EmptyState'

import { searchLocation, reverseGeocode } from '../services/location/locationApi'
import { getAirQuality } from '../services/airQuality/airQualityApi'
import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'
import {
  fetchSavedLocations,
  saveLocationToDb,
  removeSavedLocationFromDb,
  updateSavedLocationThreshold,
} from '../services/supabase/supabaseService'

export default function MyLocations() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { t } = useLanguage()

  // =========================================================
  // SAVED LOCATIONS PERSISTENT STATE (SUPABASE)
  // =========================================================

  const [mySavedLocations, setMySavedLocations] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [removingLocation, setRemovingLocation] = useState(null)

  // THRESHOLD MODAL STATES
  const [savingLocationModal, setSavingLocationModal] = useState(null)
  const [savingThreshold, setSavingThreshold] = useState(100)
  const [editingThresholdLocation, setEditingThresholdLocation] = useState(null)
  const [editingThresholdValue, setEditingThresholdValue] = useState(100)

  // ERROR FEEDBACK STATE FOR STEP 1 DEBUGGING
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    if (!currentUser?.id) {
      setMySavedLocations([])
      setLoadingLocations(false)
      return
    }

    let isMounted = true
    setLoadingLocations(true)
    setActionError(null)

    fetchSavedLocations(currentUser.id)
      .then((locations) => {
        if (isMounted) {
          setMySavedLocations(locations)
          setLoadingLocations(false)
        }
      })
      .catch((err) => {
        console.error('Error fetching saved locations:', err)
        if (isMounted) {
          setLoadingLocations(false)
          setActionError(`Failed to fetch locations: ${err.message || String(err)}`)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentUser?.id])

  const handleRemoveRequest = (target) => {
    if (!target) return
    setRemovingLocation(target)
  }

  const handleConfirmRemove = async () => {
    if (!removingLocation) return
    if (!currentUser?.id) {
      setActionError('Cannot remove: user is not logged in (currentUser.id is undefined).')
      setRemovingLocation(null)
      return
    }
    const targetId = removingLocation.id
    try {
      setActionError(null)
      console.log('Confirming remove for locationId:', targetId, 'userId:', currentUser.id)
      const success = await removeSavedLocationFromDb(currentUser.id, targetId)
      if (success) {
        setMySavedLocations((prev) => prev.filter((loc) => loc.id !== targetId))
      }
    } catch (error) {
      console.error('Remove location failed:', error)
      setActionError(`Failed to remove location: ${error.message || String(error)}`)
    } finally {
      setRemovingLocation(null)
    }
  }

  const handleSaveLocation = (loc) => {
    if (!currentUser?.id) {
      setActionError('Cannot save: User is not logged in. Please sign in.')
      navigate('/login')
      return
    }
    setSavingLocationModal(loc)
    setSavingThreshold(loc.alertThreshold || 100)
  }

  const confirmSaveWithThreshold = async () => {
    if (!savingLocationModal) return
    if (!currentUser?.id) {
      setActionError('Cannot save: User session ID (currentUser.id) is missing or undefined.')
      setSavingLocationModal(null)
      return
    }
    try {
      setActionError(null)
      const locToSave = {
        ...savingLocationModal,
        alertThreshold: savingThreshold,
      }
      console.log('Confirming save location payload:', locToSave, 'currentUser:', currentUser)
      const savedLoc = await saveLocationToDb(currentUser.id, locToSave)
      if (savedLoc) {
        setMySavedLocations((prev) => [
          savedLoc,
          ...prev.filter((item) => item.id !== savedLoc.id),
        ])
      }
    } catch (error) {
      console.error('Save location failed:', error)
      setActionError(`Failed to save location: ${error.message || String(error)}`)
    } finally {
      setSavingLocationModal(null)
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
      const success = await updateSavedLocationThreshold(currentUser.id, targetId, editingThresholdValue)
      if (success) {
        setMySavedLocations((prev) =>
          prev.map((loc) =>
            loc.id === targetId ? { ...loc, alertThreshold: editingThresholdValue } : loc
          )
        )
      }
    } catch (err) {
      console.error('Failed to update threshold:', err)
    } finally {
      setEditingThresholdLocation(null)
    }
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

      {/* ERROR DEBUG BANNER FOR STEP 1 */}
      {actionError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-md flex items-start justify-between gap-4 animate-shake">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-sm">Action Failed (Error details below):</h4>
              <p className="font-mono text-xs mt-1 text-red-800 break-all">{actionError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="shrink-0 rounded-lg bg-red-200 px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

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

        {!currentUser ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-center shadow-soft">
            <AlertTriangle size={24} className="mx-auto text-amber-600 mb-2" />
            <h3 className="font-display font-semibold text-ink-900">
              Log in to save locations and receive alerts
            </h3>
            <p className="mt-1 text-xs text-ink-500 max-w-md mx-auto">
              Guest users cannot save locations or receive voice and air quality threshold alerts. Please log in to sync your saved places and stay protected.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2 text-xs font-semibold text-white hover:bg-forest-800 transition-all shadow-sm"
            >
              Log in
            </button>
          </div>
        ) : loadingLocations ? (
          <div className="flex items-center justify-center p-12 text-ink-400">
            <Loader2 size={24} className="animate-spin text-forest-700" />
            <span className="ml-2 text-sm">{t('common.loading', { defaultValue: 'Loading saved locations...' })}</span>
          </div>
        ) : mySavedLocations.length > 0 ? (
          <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mySavedLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onRemove={(target) => handleRemoveRequest(target)}
                onViewDetails={(loc) => handleViewDetails(loc)}
                onEditThreshold={(loc) => handleEditThresholdRequest(loc)}
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

      {/* =====================================================
          SAVE NEW LOCATION WITH THRESHOLD MODAL
      ===================================================== */}
      {savingLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md scale-in rounded-2xl border border-ink-100 bg-surface p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                <BellRing size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-900">
                  Set Alert Threshold
                </h3>
                <p className="text-xs text-ink-500">
                  {savingLocationModal.name}{savingLocationModal.region ? `, ${savingLocationModal.region}` : ''}
                </p>
              </div>
            </div>

            <p className="text-xs text-ink-600 leading-relaxed mb-4">
              Set the Air Quality Index (AQI) level at which you want to receive voice and push alerts for this location.
            </p>

            <div className="space-y-4 rounded-xl border border-ink-100 bg-ink-50/50 p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink-700">
                  AQI Alert Threshold:
                </label>
                <span className="font-mono text-base font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200">
                  {savingThreshold} AQI
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={savingThreshold}
                onChange={(e) => setSavingThreshold(Number(e.target.value))}
                className="w-full accent-forest-700 cursor-pointer"
              />

              <div className="flex gap-2 pt-1">
                {[10, 50, 100, 150, 200].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSavingThreshold(preset)}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-md border transition-all ${
                      savingThreshold === preset
                        ? 'bg-forest-700 text-white border-forest-700'
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
                onClick={() => setSavingLocationModal(null)}
                className="rounded-xl border border-ink-200 bg-surface px-4 py-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmSaveWithThreshold}
                className="rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-forest-800 transition-colors"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT EXISTING LOCATION THRESHOLD MODAL
      ===================================================== */}
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
                <p className="text-xs text-ink-500">
                  {editingThresholdLocation.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-ink-600 leading-relaxed mb-4">
              Update your trigger AQI for voice &amp; push notifications for {editingThresholdLocation.name}.
            </p>

            <div className="space-y-4 rounded-xl border border-ink-100 bg-ink-50/50 p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink-700">
                  Trigger AQI Threshold:
                </label>
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

    </div>
  )
}