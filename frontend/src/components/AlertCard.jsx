import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

const SEVERITY = {
  critical: { icon: AlertTriangle, color: '#D8492E', bg: '#FBE2DC', dot: '🔴' },
  warning: { icon: AlertCircle, color: '#D6A70C', bg: '#FBF3D9', dot: '🟡' },
  info: { icon: Info, color: '#166B3E', bg: '#E6F7EC', dot: '🟢' },
}

export default function AlertCard({ alert }) {
  const meta = SEVERITY[alert.severity] || SEVERITY.info
  const Icon = meta.icon

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 flex gap-4 transition-shadow ${
        alert.read ? 'bg-surface border-ink-100' : 'bg-white border-ink-200 shadow-soft'
      }`}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: meta.bg }}>
        <Icon size={18} style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-ink-900 text-sm">{alert.title}</p>
          {!alert.read && <span className="w-2 h-2 rounded-full bg-forest-600 mt-1.5 shrink-0" aria-label="Unread" />}
        </div>
        <p className="text-sm text-ink-700 mt-1 leading-relaxed">{alert.message}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-ink-500">
          <span>{alert.location}</span>
          {alert.aqi && <span className="font-mono font-medium text-ink-700">AQI: {alert.aqi}</span>}
          <span>{alert.time}</span>
        </div>
      </div>
    </div>
  )
}
