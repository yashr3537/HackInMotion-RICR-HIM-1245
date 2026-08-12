import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Plus } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import RiskBadge from '../components/RiskBadge'
import { EmptyState } from '../components/EmptyState'
import { exploreResults } from '../data/demoData'

export default function Explore() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return exploreResults
    const q = query.toLowerCase()
    return exploreResults.filter((r) => r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink-900">Explore</h1>
        <p className="text-ink-500 text-sm mt-1.5">Search any city to check its current air quality.</p>
      </div>

      <SearchBar value={query} onChange={setQuery} placeholder="Search a city or region…" className="max-w-md" />

      {results.length === 0 ? (
        <EmptyState
          variant="location-not-found"
          title="No matching locations"
          description={`We couldn't find a location matching "${query}". Try a different city or region name.`}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((loc) => (
            <div key={loc.id} className="bg-surface rounded-xl border border-ink-100 shadow-soft p-5 flex flex-col gap-4 hover:shadow-card transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-forest-600" />
                  <div>
                    <p className="font-display font-semibold text-ink-900">{loc.name}</p>
                    <p className="text-xs text-ink-500">{loc.region}</p>
                  </div>
                </div>
                <button className="text-ink-300 hover:text-forest-600 transition-colors p-1" aria-label={`Add ${loc.name}`}>
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex items-end justify-between">
                <p className="font-mono font-bold text-2xl text-ink-900">{loc.aqi}</p>
                <RiskBadge aqi={loc.aqi} size="sm" />
              </div>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-forest-700 hover:text-forest-800 self-start"
              >
                View details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
