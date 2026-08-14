import { useEffect, useMemo, useState, useRef } from 'react'
import {
  BarChart3,
  MapPin,
  Activity,
  Wind,
  Thermometer,
  Droplets,
  Trophy,
  Sparkles,
  Search,
  Loader2,
  X,
} from 'lucide-react'

import RiskBadge from '../components/RiskBadge'
import { getAirQuality, getWeather } from '../services/airQuality/airQualityApi'
import { searchLocation } from '../services/location/locationApi'
import { fetchSavedLocations } from '../services/supabase/supabaseService'
import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'

const DEFAULT_CITIES = [
  {
    id: 'cmp-bhopal',
    name: 'Bhopal',
    region: 'Madhya Pradesh',
    latitude: 23.2599,
    longitude: 77.4126,
  },
  {
    id: 'cmp-indore',
    name: 'Indore',
    region: 'Madhya Pradesh',
    latitude: 22.7196,
    longitude: 75.8577,
  },
  { id: 'cmp-delhi', name: 'Delhi', region: 'Delhi NCR', latitude: 28.6139, longitude: 77.209 },
]

const getRiskMeta = (aqi, t) => {
  if (aqi === null || aqi === undefined) {
    return { label: 'Unavailable', color: '#6B7280', bg: '#F3F4F6' }
  }
  const val = Number(aqi)
  if (val <= 50) {
    return {
      label: t ? t('aqi.good', { defaultValue: 'Good' }) : 'Good',
      color: '#22A85F',
      bg: '#E6F7EC',
    }
  }
  if (val <= 100) {
    return {
      label: t ? t('aqi.moderate', { defaultValue: 'Moderate' }) : 'Moderate',
      color: '#D6A70C',
      bg: '#FBF3D9',
    }
  }
  if (val <= 150) {
    return {
      label: t ? t('aqi.sensitive', { defaultValue: 'Sensitive' }) : 'Sensitive',
      color: '#E5822A',
      bg: '#FCEADA',
    }
  }
  if (val <= 200) {
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
  if (location.loading) return '--'
  if (key === 'aqi')
    return location.aqi !== null && location.aqi !== undefined ? location.aqi : '--'
  if (key === 'pm25')
    return location.pm25 !== null && location.pm25 !== undefined ? location.pm25 : '--'
  if (key === 'pm10')
    return location.pm10 !== null && location.pm10 !== undefined ? location.pm10 : '--'
  if (key === 'no2')
    return location.no2 !== null && location.no2 !== undefined ? location.no2 : '--'
  if (key === 'temperature')
    return location.temperature !== null && location.temperature !== undefined
      ? location.temperature
      : '--'
  if (key === 'humidity')
    return location.humidity !== null && location.humidity !== undefined ? location.humidity : '--'
  return '--'
}

const METRICS = [
  { key: 'aqi', label: 'AQI', icon: Activity, unit: '' },
  { key: 'pm25', label: 'PM2.5', icon: Wind, unit: 'µg/m³' },
  { key: 'pm10', label: 'PM10', icon: Wind, unit: 'µg/m³' },
  { key: 'no2', label: 'NO₂', icon: Activity, unit: 'µg/m³' },
  { key: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°C' },
  { key: 'humidity', label: 'Humidity', icon: Droplets, unit: '%' },
]

export default function Compare() {
  const { t } = useLanguage()
  const { currentUser } = useAuth()
  const [compareList, setCompareList] = useState([])
  const [loadingInitial, setLoadingInitial] = useState(true)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [notice, setNotice] = useState(null)
  const searchRef = useRef(null)

  // Debounced search logic
  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (!trimmed) {
      setSearchSuggestions([])
      setIsSearching(false)
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    setShowDropdown(true)
    const timer = setTimeout(async () => {
      try {
        const results = await searchLocation(trimmed)
        setSearchSuggestions(results || [])
      } catch (err) {
        console.error('Search error:', err)
        setSearchSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-dismiss notification toast
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notice])

  // Initialize locations list on mount (loading from localStorage if present)
  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      let baseList = null

      try {
        const raw = localStorage.getItem('airguard-compare-list')
        if (raw !== null) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            baseList = parsed
          }
        }
      } catch (e) {
        console.error('Failed to parse compare list from localStorage:', e)
      }

      // Default fallback if no saved compare list exists yet
      if (baseList === null) {
        baseList = DEFAULT_CITIES
        if (currentUser?.id) {
          try {
            const saved = await fetchSavedLocations(currentUser.id)
            if (saved && saved.length > 0) {
              baseList = saved.slice(0, 4)
            }
          } catch (e) {}
        }
      }

      if (baseList.length === 0) {
        if (isMounted) {
          setCompareList([])
          setLoadingInitial(false)
        }
        return
      }

      // Fetch live AQI and weather data for compare list in parallel
      const updatedList = await Promise.all(
        baseList.map(async (city) => {
          if (city.latitude && city.longitude) {
            try {
              const [aqData, weatherData] = await Promise.all([
                getAirQuality(city.latitude, city.longitude),
                getWeather(city.latitude, city.longitude),
              ])
              return {
                ...city,
                id: city.id || `loc-${city.name.toLowerCase()}`,
                aqi: aqData?.aqi ?? null,
                pm25: aqData?.pm25 ?? null,
                pm10: aqData?.pm10 ?? null,
                no2: aqData?.no2 ?? null,
                temperature: weatherData?.temperature ?? null,
                humidity: weatherData?.humidity ?? null,
                loading: false,
              }
            } catch (err) {
              console.error(`Failed to fetch live data for ${city.name}:`, err)
            }
          }
          return { ...city, loading: false }
        })
      )

      if (isMounted) {
        setCompareList(updatedList)
        setLoadingInitial(false)
      }
    }

    loadInitialData()
    return () => {
      isMounted = false
    }
  }, [currentUser?.id])

  // Sync compareList changes to localStorage
  useEffect(() => {
    if (loadingInitial) return
    try {
      const lightweightList = compareList.map((item) => ({
        id: item.id,
        name: item.name,
        region: item.region || '',
        latitude: item.latitude,
        longitude: item.longitude,
      }))
      localStorage.setItem('airguard-compare-list', JSON.stringify(lightweightList))
    } catch (e) {
      console.error('Failed to persist compare list to localStorage:', e)
    }
  }, [compareList, loadingInitial])

  // Add location from search suggestions
  const handleSelectLocation = async (result) => {
    setShowDropdown(false)
    setSearchQuery('')

    // Check maximum limit
    if (compareList.length >= 6) {
      setNotice({
        type: 'warning',
        text: 'Maximum 6 cities can be compared. Remove a city to add another.',
      })
      return
    }

    // Check duplicate
    const isDuplicate = compareList.some(
      (loc) =>
        (loc.latitude === result.latitude && loc.longitude === result.longitude) ||
        (loc.name.toLowerCase() === result.name.toLowerCase() &&
          (loc.region || '').toLowerCase() === (result.region || '').toLowerCase())
    )

    if (isDuplicate) {
      setNotice({ type: 'warning', text: `"${result.name}" is already in your comparison list.` })
      return
    }

    const tempId = `loc-${result.name.toLowerCase()}-${Date.now()}`
    const placeholderCity = {
      id: tempId,
      name: result.name,
      region: result.region || result.country || '',
      latitude: result.latitude,
      longitude: result.longitude,
      loading: true,
      aqi: null,
      pm25: null,
      pm10: null,
      no2: null,
      temperature: null,
      humidity: null,
    }

    setCompareList((prev) => [...prev, placeholderCity])

    // Fetch live data for selected city
    try {
      const [aqData, weatherData] = await Promise.all([
        getAirQuality(result.latitude, result.longitude),
        getWeather(result.latitude, result.longitude),
      ])

      setCompareList((prev) =>
        prev.map((item) =>
          item.id === tempId
            ? {
                ...item,
                aqi: aqData?.aqi ?? null,
                pm25: aqData?.pm25 ?? null,
                pm10: aqData?.pm10 ?? null,
                no2: aqData?.no2 ?? null,
                temperature: weatherData?.temperature ?? null,
                humidity: weatherData?.humidity ?? null,
                loading: false,
              }
            : item
        )
      )
    } catch (e) {
      console.error('Failed to load air quality for selected location:', e)
      setCompareList((prev) =>
        prev.map((item) => (item.id === tempId ? { ...item, loading: false } : item))
      )
    }
  }

  // Remove city permanently
  const handleRemoveCity = (idToRemove) => {
    setCompareList((prev) => prev.filter((city) => city.id !== idToRemove))
  }

  // Active loaded list sorted by AQI
  const validList = useMemo(
    () =>
      compareList.filter((item) => !item.loading && item.aqi !== null && item.aqi !== undefined),
    [compareList]
  )

  const sortedByAqi = useMemo(() => {
    return [...compareList].sort((a, b) => {
      if (a.aqi === null) return 1
      if (b.aqi === null) return -1
      return Number(a.aqi) - Number(b.aqi)
    })
  }, [compareList])

  const best = useMemo(
    () => (validList.length > 0 ? [...validList].sort((a, b) => a.aqi - b.aqi)[0] : null),
    [validList]
  )
  const worst = useMemo(
    () => (validList.length > 0 ? [...validList].sort((a, b) => b.aqi - a.aqi)[0] : null),
    [validList]
  )

  const averageAqi = useMemo(() => {
    if (validList.length === 0) return '--'
    const total = validList.reduce((sum, item) => sum + Number(item.aqi || 0), 0)
    return Math.round(total / validList.length)
  }, [validList])

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
          {t('compare.subtitle', {
            defaultValue:
              'Compare live air-quality conditions across cities and analyze key environmental metrics side-by-side.',
          })}
        </p>
      </section>

      {/* SEARCH AND LOCATION SELECTOR */}
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
                  {t('compare.question', { defaultValue: 'Search & add cities to compare' })}
                </h2>
              </div>

              <span className="text-xs font-medium text-ink-400">
                {compareList.length} / 6 cities compared
              </span>
            </div>

            {/* SEARCH BOX INPUT */}
            <div ref={searchRef} className="relative mb-5 max-w-xl">
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-3.5 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim()) setShowDropdown(true)
                  }}
                  placeholder="Type city name to add (e.g. Pune, Mumbai, Delhi)..."
                  className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-ink-900 placeholder-ink-400 transition-all duration-200 focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-600/20"
                />
                {isSearching ? (
                  <Loader2 size={16} className="absolute right-3.5 animate-spin text-forest-600" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setShowDropdown(false)
                    }}
                    className="absolute right-3 text-ink-400 hover:text-ink-700"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>

              {/* SEARCH SUGGESTIONS DROPDOWN */}
              {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-lg backdrop-blur-md">
                  {isSearching ? (
                    <div className="flex items-center gap-2 p-4 text-xs text-ink-500">
                      <Loader2 size={14} className="animate-spin text-forest-600" />
                      Searching locations...
                    </div>
                  ) : searchSuggestions.length === 0 ? (
                    <div className="p-4 text-xs text-ink-500">
                      No locations found matching &quot;{searchQuery}&quot;.
                    </div>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto divide-y divide-ink-50">
                      {searchSuggestions.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectLocation(item)}
                            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-forest-50/60"
                          >
                            <span className="font-semibold text-ink-900">{item.name}</span>
                            <span className="text-xs text-ink-400">
                              {item.region ? `${item.region}, ` : ''}
                              {item.country}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* NOTIFICATION NOTICE BANNER */}
            {notice && (
              <div
                className={`mb-4 flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-medium ${
                  notice.type === 'warning'
                    ? 'border border-amber-200 bg-amber-50 text-amber-900'
                    : 'border border-forest-200 bg-forest-50 text-forest-900'
                }`}
              >
                <span>{notice.text}</span>
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  className="ml-2 text-ink-500 hover:text-ink-800"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* CITY CHIPS WITH REMOVE BUTTON */}
            <div className="stagger-children flex flex-wrap gap-2.5">
              {compareList.map((location) => (
                <div
                  key={location.id}
                  className="group inline-flex items-center gap-2 rounded-xl border border-forest-700 bg-forest-700 py-1.5 pl-3.5 pr-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300"
                >
                  <MapPin size={13} className="text-forest-200" />
                  <span>{location.name}</span>

                  <button
                    type="button"
                    onClick={() => handleRemoveCity(location.id)}
                    title={`Remove ${location.name}`}
                    className="ml-1 rounded-lg p-1 text-forest-200 hover:bg-forest-800 hover:text-white transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}
      {compareList.length === 0 ? (
        <section className="fade-up">
          <div className="rounded-2xl border border-ink-100 bg-surface p-10 text-center shadow-soft">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-700">
              <BarChart3 size={20} />
            </div>

            <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">
              Search and add a city to start comparing
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
              Use the search bar above to select cities and compare live environmental air quality
              metrics side-by-side.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* =================================================
              SUMMARY STATS
          ================================================== */}
          <section className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                <MapPin size={12} />
                Compared
              </div>

              <div className="mt-2 font-mono text-2xl font-bold text-ink-900">
                {compareList.length}
              </div>

              <p className="mt-1 text-[10px] text-ink-500">Cities active</p>
            </div>

            <div className="card-hover rounded-xl border border-forest-100 bg-forest-50 p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-forest-700">
                <Trophy size={12} />
                Lowest AQI (Best)
              </div>

              <div className="mt-2 font-mono text-2xl font-bold text-forest-800">
                {best?.aqi ?? '--'}
              </div>

              <p className="mt-1 truncate text-[10px] text-forest-700/70">{best?.name || '—'}</p>
            </div>

            <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                <Activity size={12} />
                Average
              </div>

              <div className="mt-2 font-mono text-2xl font-bold text-ink-900">{averageAqi}</div>

              <p className="mt-1 text-[10px] text-ink-500">Mean AQI</p>
            </div>

            <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                <Activity size={12} />
                Highest AQI
              </div>

              <div className="mt-2 font-mono text-2xl font-bold text-ink-900">
                {worst?.aqi ?? '--'}
              </div>

              <p className="mt-1 truncate text-[10px] text-ink-500">{worst?.name || '—'}</p>
            </div>
          </section>

          {/* =================================================
              LOCATION COMPARISON GRID CARDS
          ================================================== */}
          <section>
            <div className="fade-up mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-forest-700">
                  Current conditions
                </p>

                <h2 className="mt-1 font-display text-lg font-semibold text-ink-900 sm:text-xl">
                  Live location cards
                </h2>
              </div>

              <span className="text-[10px] uppercase tracking-[0.12em] text-ink-400">
                Lower AQI is better
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedByAqi.map((location) => {
                const isBest = best?.id === location.id
                const isWorst = worst?.id === location.id
                const risk = getRiskMeta(location.aqi, t)

                return (
                  <div
                    key={location.id}
                    className={`card-hover card-glow group relative overflow-hidden rounded-2xl border p-5 shadow-soft transition-all duration-300 ${
                      isBest ? 'border-forest-200 bg-forest-50' : 'border-ink-100 bg-surface'
                    }`}
                  >
                    {/* Ambient glow */}
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125"
                      style={{
                        backgroundColor: risk.color,
                        opacity: 0.06,
                      }}
                    />

                    {/* REMOVE BUTTON ON CARD */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCity(location.id)}
                      title={`Remove ${location.name}`}
                      className="absolute right-3.5 top-3.5 z-20 rounded-full p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <X size={15} />
                    </button>

                    {location.loading ? (
                      <div className="flex h-48 flex-col items-center justify-center gap-3">
                        <Loader2 size={24} className="animate-spin text-forest-600" />
                        <span className="text-xs font-medium text-ink-500">
                          Fetching live AQI for {location.name}...
                        </span>
                      </div>
                    ) : (
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

                        <div className="flex items-start justify-between gap-3 pr-6">
                          <div className="min-w-0">
                            <p className="truncate font-display text-lg font-semibold text-ink-900">
                              {location.name}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                              <MapPin size={11} />
                              {location.region || location.country || 'Location'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                                AQI
                              </p>

                              <p
                                className="mt-1 font-mono text-4xl font-bold tracking-[-0.05em]"
                                style={{
                                  color: isBest ? '#166B3E' : '#18221E',
                                }}
                              >
                                {location.aqi ?? '--'}
                              </p>
                            </div>

                            <RiskBadge aqi={location.aqi} size="sm" />
                          </div>

                          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-100">
                            <div
                              className="progress-fill h-full rounded-full"
                              style={{
                                width: `${Math.min(((location.aqi || 0) / 300) * 100, 100)}%`,
                                backgroundColor: risk.color,
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4 text-[10px] text-ink-400">
                          <span>Current reading</span>
                          <span className="font-semibold" style={{ color: risk.color }}>
                            {risk.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* =================================================
              METRIC COMPARISON TABLE
          ================================================== */}
          <section className="fade-up">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-forest-700">
                Environmental metrics
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-ink-900 sm:text-xl">
                Compare pollutant & weather readings
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
                      <tr key={metric.key} className="border-b border-ink-100 last:border-b-0">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                              <Icon size={14} />
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-ink-800">{metric.label}</p>
                              {metric.unit && (
                                <p className="text-[9px] text-ink-400">{metric.unit}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {sortedByAqi.map((location) => {
                          const val = getMetricValue(location, metric.key)
                          return (
                            <td key={`${location.id}-${metric.key}`} className="px-5 py-4">
                              <span className="font-mono text-sm font-semibold text-ink-900">
                                {val} {metric.unit && val !== '--' ? metric.unit : ''}
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

          {/* INSIGHT */}
          {best && worst && (
            <section className="fade-up">
              <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-5 sm:p-6">
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-forest-400/10 blur-3xl float-soft" />

                <div className="relative flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 shadow-sm">
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-ink-900">Live comparison insight</p>
                    <p className="mt-1 text-xs leading-6 text-ink-600">
                      <strong>{best.name}</strong> currently has the cleanest air among compared
                      cities with an AQI of {best.aqi}. <strong>{worst.name}</strong> records the
                      highest pollution level at {worst.aqi}.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
