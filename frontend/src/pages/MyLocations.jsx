import { useMemo, useState } from 'react'
import {
  Plus,
  SlidersHorizontal,
  MapPinned,
  BellRing,
  Activity,
  ShieldCheck,
  Search,
} from 'lucide-react'

import SearchBar from '../components/SearchBar'
import LocationCard from '../components/LocationCard'
import { EmptyState } from '../components/EmptyState'
import { savedLocations as initialLocations } from '../data/demoData'

export default function MyLocations() {
  const [locations, setLocations] = useState(initialLocations)
  const [query, setQuery] = useState('')
  const [threshold, setThreshold] = useState(100)

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()

    if (!search) return locations

    return locations.filter(
      (location) =>
        location.name.toLowerCase().includes(search) ||
        location.type.toLowerCase().includes(search) ||
        location.region.toLowerCase().includes(search),
    )
  }, [locations, query])

  function handleRemove(id) {
    setLocations((prev) =>
      prev.filter((location) => location.id !== id),
    )
  }

  return (
    <div className="page-enter flex flex-col gap-7 pb-8 sm:gap-9">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <section className="fade-down">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
              <MapPinned size={12} />
              Personal monitoring
            </div>

            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
              My Locations
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
              Manage the places you care about and keep their air quality
              close at hand.
            </p>
          </div>

          <button
            type="button"
            className="btn-premium inline-flex w-fit items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800"
          >
            <Plus size={16} />
            Add Location
          </button>
        </div>
      </section>

      {/* =====================================================
          SUMMARY
      ====================================================== */}
      <section className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
            <MapPinned size={12} />
            Saved
          </div>

          <div className="mt-2 font-mono text-2xl font-bold text-ink-900">
            {locations.length}
          </div>

          <p className="mt-1 text-[10px] text-ink-500">
            Monitored locations
          </p>
        </div>

        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
            <BellRing size={12} />
            Alerts
          </div>

          <div className="mt-2 font-mono text-2xl font-bold text-ink-900">
            {locations.filter(
              (location) => Number(location.aqi) >= threshold,
            ).length}
          </div>

          <p className="mt-1 text-[10px] text-ink-500">
            Above threshold
          </p>
        </div>

        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
            <Activity size={12} />
            Average AQI
          </div>

          <div className="mt-2 font-mono text-2xl font-bold text-ink-900">
            {locations.length
              ? Math.round(
                  locations.reduce(
                    (sum, location) =>
                      sum + Number(location.aqi || 0),
                    0,
                  ) / locations.length,
                )
              : 0}
          </div>

          <p className="mt-1 text-[10px] text-ink-500">
            Across saved places
          </p>
        </div>

        <div className="card-hover rounded-xl border border-forest-100 bg-forest-50 p-4 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-forest-700">
            <ShieldCheck size={12} />
            Monitoring
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-forest-800">
            <span className="live-dot h-2 w-2 rounded-full bg-forest-600" />
            Active
          </div>

          <p className="mt-1 text-[10px] text-forest-700/70">
            Alerts enabled
          </p>
        </div>
      </section>

      {/* =====================================================
          CONTROLS
      ====================================================== */}
      <section className="fade-up">
        <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-surface p-4 shadow-soft sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="w-full lg:max-w-md">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search saved locations…"
            />

            {query && (
              <div className="mt-2 flex items-center gap-1.5 px-1 text-[10px] text-ink-400">
                <Search size={11} />
                Showing {filtered.length} result
                {filtered.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Threshold */}
          <div className="w-full rounded-xl border border-ink-100 bg-ink-50/70 p-4 lg:max-w-md">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-forest-700 shadow-sm">
                  <SlidersHorizontal size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-ink-800">
                    Alert Threshold
                  </p>

                  <p className="mt-0.5 text-[10px] text-ink-400">
                    Notify me when AQI reaches this level
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-forest-100 bg-white px-3 py-1.5 font-mono text-sm font-bold text-forest-800 shadow-sm">
                {threshold}
              </div>
            </div>

            <div className="mt-4">
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={threshold}
                onChange={(event) =>
                  setThreshold(Number(event.target.value))
                }
                className="w-full accent-forest-700"
                aria-label="Air quality alert threshold"
              />

              <div className="mt-1.5 flex justify-between text-[9px] text-ink-400">
                <span>50</span>
                <span>150</span>
                <span>250</span>
                <span>300</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOCATION LIST
      ====================================================== */}
      <section>
        <div className="fade-up mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
              Saved places
            </p>

            <h2 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
              Your monitored locations
            </h2>
          </div>

          <span className="text-xs text-ink-400">
            {filtered.length} shown
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="fade-up rounded-2xl border border-ink-100 bg-surface p-3">
            <EmptyState
              variant="no-locations"
              title={
                query
                  ? 'No matching locations'
                  : 'No saved locations'
              }
              description={
                query
                  ? 'Try searching with a different location name or type.'
                  : 'You have not saved any locations yet. Add one to start tracking air quality and receiving alerts.'
              }
              action={
                <button
                  type="button"
                  className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-800"
                >
                  <Plus size={16} />
                  Add Location
                </button>
              }
            />
          </div>
        ) : (
          <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          BOTTOM INFO
      ====================================================== */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-forest-400/10 blur-3xl float-soft" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                <ShieldCheck size={12} />
                Monitoring preference
              </div>

              <p className="mt-1.5 text-sm font-semibold text-ink-900">
                Alerts will trigger when a location reaches AQI {threshold}.
              </p>

              <p className="mt-1 text-xs leading-5 text-ink-500">
                You can change this threshold anytime from your location
                monitoring settings.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-forest-800">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-600" />
              Monitoring active
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}