import { useState } from 'react'
import { Plus, SlidersHorizontal } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import LocationCard from '../components/LocationCard'
import { EmptyState } from '../components/EmptyState'
import { savedLocations as initialLocations } from '../data/demoData'

export default function MyLocations() {
  const [locations, setLocations] = useState(initialLocations)
  const [query, setQuery] = useState('')
  const [threshold, setThreshold] = useState(100)

  const filtered = locations.filter(
    (l) => l.name.toLowerCase().includes(query.toLowerCase()) || l.type.toLowerCase().includes(query.toLowerCase())
  )

  function handleRemove(id) {
    setLocations((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink-900">My Locations</h1>
          <p className="text-ink-500 text-sm mt-1.5">Manage the places you track for air quality and alerts.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors shrink-0">
          <Plus size={16} />
          Add Location
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <SearchBar value={query} onChange={setQuery} placeholder="Search saved locations…" className="max-w-sm" />
        <div className="flex items-center gap-3 bg-surface border border-ink-100 rounded-lg px-4 py-2.5 text-sm">
          <SlidersHorizontal size={15} className="text-ink-500" />
          <span className="text-ink-700">Alert threshold</span>
          <input
            type="range"
            min="50"
            max="300"
            step="10"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-28 accent-forest-700"
          />
          <span className="font-mono font-semibold text-ink-900 w-9">{threshold}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          variant="no-locations"
          title="No saved locations"
          description="You haven't saved any locations yet. Add one to start tracking its air quality and get alerts."
          action={
            <button className="inline-flex items-center gap-2 bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors">
              <Plus size={16} />
              Add Location
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((loc) => (
            <LocationCard key={loc.id} location={loc} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
