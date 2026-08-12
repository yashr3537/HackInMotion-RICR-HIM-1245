import { Bell, Moon, Globe, ShieldCheck } from 'lucide-react'

const ROWS = [
  { icon: Bell, title: 'Push Notifications', description: 'Receive alerts when air quality changes at saved locations.', enabled: true },
  { icon: Moon, title: 'Dark Mode', description: 'Switch to a darker color scheme.', enabled: false },
  { icon: Globe, title: 'Units', description: 'Metric (µg/m³, mg/m³)', toggle: false },
  { icon: ShieldCheck, title: 'Data & Privacy', description: 'Manage how your location data is used.', toggle: false },
]

export default function Settings() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink-900">Settings</h1>
        <p className="text-ink-500 text-sm mt-1.5">Manage app preferences. Backend sync not yet connected.</p>
      </div>

      <div className="bg-surface rounded-xl2 border border-ink-100 shadow-soft divide-y divide-ink-100">
        {ROWS.map((r) => {
          const Icon = r.icon
          return (
            <div key={r.title} className="flex items-center gap-4 p-5">
              <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-forest-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-900">{r.title}</p>
                <p className="text-xs text-ink-500 mt-0.5">{r.description}</p>
              </div>
              {r.toggle !== false ? (
                <button
                  className={`w-11 h-6 rounded-full transition-colors relative ${r.enabled ? 'bg-forest-700' : 'bg-ink-200'}`}
                  aria-label={`Toggle ${r.title}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${r.enabled ? 'left-6' : 'left-1'}`}
                  />
                </button>
              ) : (
                <span className="text-xs text-ink-500">—</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
