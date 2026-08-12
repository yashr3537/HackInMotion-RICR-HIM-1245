import { Wind, CircleDot, Cloud, Sun, FlaskConical, Flame } from 'lucide-react'
import { getAqiBand } from '../data/aqiUtils'

const ICONS = {
  pm25: CircleDot,
  pm10: Cloud,
  no2: FlaskConical,
  o3: Sun,
  so2: Flame,
  co: Wind,
}

// Pollutant sub-values don't map to the AQI 0-300 scale, so we derive a
// lightweight status tint from the demo `status` field rather than aqiUtils.
const STATUS_COLORS = {
  good: { color: '#22A85F', bg: '#E6F7EC' },
  moderate: { color: '#D6A70C', bg: '#FBF3D9' },
  sensitive: { color: '#E5822A', bg: '#FCEADA' },
}

export default function PollutantCard({ pollutant }) {
  const Icon = ICONS[pollutant.key] || Wind
  const tint = STATUS_COLORS[pollutant.status] || STATUS_COLORS.good

  return (
    <div className="bg-surface rounded-xl border border-ink-100 shadow-soft p-4 flex flex-col gap-3 hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: tint.bg }}>
          <Icon size={17} style={{ color: tint.color }} />
        </div>
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tint.color }} />
      </div>
      <div>
        <p className="text-xs font-medium text-ink-500">{pollutant.label}</p>
        <p className="font-mono font-semibold text-xl text-ink-900 mt-0.5">
          {pollutant.value}
          <span className="text-xs font-normal text-ink-500 ml-1">{pollutant.unit}</span>
        </p>
      </div>
    </div>
  )
}
