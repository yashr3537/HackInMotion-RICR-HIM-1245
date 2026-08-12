import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import AlertCard from '../components/AlertCard'
import { EmptyState } from '../components/EmptyState'
import { alerts as initialAlerts } from '../data/demoData'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [filter, setFilter] = useState('all')

  const filtered = alerts.filter((a) => (filter === 'all' ? true : filter === 'unread' ? !a.read : a.read))

  function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink-900">Alerts</h1>
          <p className="text-ink-500 text-sm mt-1.5">Stay informed when your saved locations become risky.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={markAllRead} className="text-sm font-medium text-forest-700 hover:text-forest-800">
            Mark all read
          </button>
          <button className="inline-flex items-center gap-2 bg-surface border border-ink-100 hover:border-forest-300 text-ink-900 font-medium text-sm px-3.5 py-2.5 rounded-lg transition-colors">
            <Settings2 size={15} />
            Alert Settings
          </button>
        </div>
      </div>

      <div className="flex bg-ink-100 rounded-lg p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filter === f.key ? 'bg-white text-forest-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          variant="no-alerts"
          title="No alerts here"
          description="You're all caught up. We'll notify you when a saved location's air quality changes significantly."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
        </div>
      )}
    </div>
  )
}
