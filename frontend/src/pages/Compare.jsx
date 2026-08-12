import { useState } from 'react'
import { Check, Trophy } from 'lucide-react'
import RiskBadge from '../components/RiskBadge'
import { compareLocations } from '../data/demoData'

export default function Compare() {
  const [selected, setSelected] = useState(compareLocations.map((l) => l.id))

  const active = compareLocations.filter((l) => selected.includes(l.id))
  const best = active.length ? active.reduce((a, b) => (a.aqi < b.aqi ? a : b)) : null

  function toggle(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink-900">Compare Locations</h1>
        <p className="text-ink-500 text-sm mt-1.5">Select locations below to compare their current air quality.</p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {compareLocations.map((l) => (
          <button
            key={l.id}
            onClick={() => toggle(l.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              selected.includes(l.id)
                ? 'bg-forest-700 border-forest-700 text-white'
                : 'bg-surface border-ink-200 text-ink-700 hover:border-forest-300'
            }`}
          >
            {selected.includes(l.id) && <Check size={14} />}
            {l.name}
          </button>
        ))}
      </div>

      {active.length === 0 ? (
        <p className="text-sm text-ink-500 py-10 text-center">Select at least one location to compare.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {active
            .slice()
            .sort((a, b) => a.aqi - b.aqi)
            .map((l) => {
              const isBest = best && l.id === best.id
              return (
                <div
                  key={l.id}
                  className={`rounded-xl2 p-6 border shadow-soft relative ${
                    isBest ? 'bg-forest-50 border-forest-300 shadow-card' : 'bg-surface border-ink-100'
                  }`}
                >
                  {isBest && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-forest-700 text-[11px] font-semibold uppercase tracking-wide">
                      <Trophy size={13} />
                      Best
                    </div>
                  )}
                  <p className="font-display font-semibold text-lg text-ink-900">{l.name}</p>
                  <p className="text-xs text-ink-500 mb-4">{l.region}</p>
                  <p className="font-mono font-bold text-3xl text-ink-900 mb-2">{l.aqi}</p>
                  <RiskBadge aqi={l.aqi} size="sm" />
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
