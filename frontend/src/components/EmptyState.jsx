import { Inbox, MapPinOff, BellOff, LineChart, WifiOff, ServerCrash, LocateFixed } from 'lucide-react'

const ICONS = {
  default: Inbox,
  'location-not-found': MapPinOff,
  'no-locations': MapPinOff,
  'no-alerts': BellOff,
  'no-history': LineChart,
  'permission-denied': LocateFixed,
  'network-error': WifiOff,
  'api-unavailable': ServerCrash,
}

export function EmptyState({ variant = 'default', title, description, action }) {
  const Icon = ICONS[variant] || ICONS.default
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-surface rounded-xl2 border border-dashed border-ink-200">
      <div className="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center mb-4">
        <Icon size={24} className="text-forest-600" />
      </div>
      <p className="font-display font-semibold text-ink-900 mb-1.5">{title}</p>
      <p className="text-sm text-ink-500 max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ variant = 'network-error', title, description, action }) {
  const Icon = ICONS[variant] || WifiOff
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-surface rounded-xl2 border border-ink-100">
      <div className="w-14 h-14 rounded-full bg-[#FBE2DC] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[#D8492E]" />
      </div>
      <p className="font-display font-semibold text-ink-900 mb-1.5">{title}</p>
      <p className="text-sm text-ink-500 max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
