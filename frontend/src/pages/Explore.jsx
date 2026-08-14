import { useEffect, useState } from 'react'
import { MapPin, Plus, Loader2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import RiskBadge from '../components/RiskBadge'
import { EmptyState } from '../components/EmptyState'
import { searchLocation } from '../services/location/locationApi'
import { getAirQuality } from '../services/airQuality/airQualityApi'

export default function Explore() {
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setResults([])
      setError('')
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError('')

        const locations = await searchLocation(trimmedQuery)

        if (!locations.length) {
          setResults([])
          return
        }

        const liveResults = await Promise.all(
          locations.map(async (location) => {
            try {
              const airQuality = await getAirQuality(
                location.latitude,
                location.longitude
              )

              return {
                ...location,
                aqi: airQuality.aqi,
                pm25: airQuality.pm25,
                pm10: airQuality.pm10,
                no2: airQuality.no2,
                o3: airQuality.o3,
                so2: airQuality.so2,
                co: airQuality.co,
                lastUpdated: airQuality.time,
              }
            } catch (aqiError) {
              console.error(
                `AQI error for ${location.name}:`,
                aqiError
              )

              return {
                ...location,
                aqi: null,
              }
            }
          })
        )

        setResults(liveResults)
      } catch (searchError) {
        console.error('Location search error:', searchError)
        setResults([])
        setError('Unable to search locations right now.')
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  // =========================================================
  // SELECT LOCATION
  // =========================================================

  const selectLocation = (location) => {
    const selectedLocation = {
      id: location.id,
      name: location.name,
      region: location.region || '',
      country: location.country || '',
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    }

    localStorage.setItem(
      'selectedAirGuardLocation',
      JSON.stringify(selectedLocation)
    )

    navigate('/dashboard')
  }

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink-900">
          Explore
        </h1>

        <p className="text-ink-500 text-sm mt-1.5">
          Search any city to check its current air quality.
        </p>
      </div>


      {/* SEARCH */}
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search a city or region…"
        className="max-w-md"
      />


      {/* LOADING */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Loader2
            size={16}
            className="animate-spin"
          />
          Searching live air quality...
        </div>
      )}


      {/* ERROR */}
      {!loading && error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}


      {/* NO RESULT */}
      {!loading &&
        !error &&
        query.trim() &&
        results.length === 0 && (
          <EmptyState
            variant="location-not-found"
            title="No matching locations"
            description={`We couldn't find a location matching "${query}". Try a different city or region name.`}
          />
        )}


      {/* RESULTS */}
      {!loading && results.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {results.map((loc) => (
            <div
              key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
              className="bg-surface rounded-xl border border-ink-100 shadow-soft p-5 flex flex-col gap-4 hover:shadow-card transition-shadow"
            >

              {/* LOCATION */}
              <div className="flex items-start justify-between">

                <div className="flex items-center gap-2">

                  <MapPin
                    size={16}
                    className="text-forest-600"
                  />

                  <div>
                    <p className="font-display font-semibold text-ink-900">
                      {loc.name}
                    </p>

                    <p className="text-xs text-ink-500">
                      {loc.region}
                      {loc.country
                        ? `, ${loc.country}`
                        : ''}
                    </p>
                  </div>

                </div>


                {/* SAVE / SELECT */}
                <button
                  type="button"
                  onClick={() => selectLocation(loc)}
                  className="text-ink-300 hover:text-forest-600 transition-colors p-1"
                  aria-label={`Select ${loc.name}`}
                  title={`Select ${loc.name}`}
                >
                  <Plus size={18} />
                </button>

              </div>


              {/* AQI */}
              <div className="flex items-end justify-between">

                <div>

                  <p className="text-[10px] uppercase tracking-wider text-ink-400">
                    Current AQI
                  </p>

                  <p className="font-mono font-bold text-2xl text-ink-900 mt-1">
                    {loc.aqi ?? '—'}
                  </p>

                </div>


                {loc.aqi !== null &&
                  loc.aqi !== undefined && (
                    <RiskBadge
                      aqi={loc.aqi}
                      size="sm"
                    />
                  )}

              </div>


              {/* POLLUTANTS */}
              <div className="grid grid-cols-2 gap-2 text-xs">

                <div className="rounded-lg bg-ink-50 p-2">

                  <p className="text-ink-400">
                    PM2.5
                  </p>

                  <p className="font-semibold text-ink-700">
                    {loc.pm25 ?? '—'}
                  </p>

                </div>


                <div className="rounded-lg bg-ink-50 p-2">

                  <p className="text-ink-400">
                    PM10
                  </p>

                  <p className="font-semibold text-ink-700">
                    {loc.pm10 ?? '—'}
                  </p>

                </div>

              </div>


              <p className="text-[10px] text-ink-400">
                Live data from Open-Meteo
              </p>


              {/* VIEW DETAILS */}
              <button
                type="button"
                onClick={() => selectLocation(loc)}
                className="flex items-center justify-between w-full mt-1 px-3 py-2 rounded-lg bg-forest-50 text-forest-700 hover:bg-forest-100 transition-colors text-sm font-medium"
              >

                <span>
                  View live details
                </span>

                <ArrowRight size={15} />

              </button>

            </div>
          ))}

        </div>
      )}


      {/* INITIAL STATE */}
      {!query.trim() && !loading && (
        <div className="rounded-xl border border-dashed border-ink-200 bg-surface p-8 text-center">

          <MapPin
            size={28}
            className="mx-auto text-forest-600 mb-3"
          />

          <p className="font-semibold text-ink-800">
            Search for a location
          </p>

          <p className="text-sm text-ink-500 mt-1">
            Enter a city or region to see its current AQI.
          </p>

        </div>
      )}

    </div>
  )
}