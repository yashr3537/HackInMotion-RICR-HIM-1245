import { getAqiBand } from '../data/aqiUtils'

export default function RiskBadge({ aqi, size = 'md' }) {
  const band = getAqiBand(aqi)
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide uppercase ${sizes[size]}`}
      style={{ backgroundColor: band.bg, color: band.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: band.color }} />
      {band.label}
    </span>
  )
}
