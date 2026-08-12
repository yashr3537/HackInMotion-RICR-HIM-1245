import { getAqiBand, aqiPercent } from '../data/aqiUtils'

// A semi-circular instrument dial, styled after a physical air-quality meter.
// The needle-less arc fill communicates magnitude; tick marks give it the
// feel of a calibrated instrument rather than a generic progress ring.
export default function AQIGauge({ aqi, size = 220 }) {
  const band = getAqiBand(aqi)
  const percent = aqiPercent(aqi)
  const radius = 80
  const circumference = Math.PI * radius
  const dash = (percent / 100) * circumference

  const ticks = Array.from({ length: 11 }, (_, i) => i)

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 200 120" className="w-full">
        {/* tick marks */}
        {ticks.map((t) => {
          const angle = Math.PI - (t / 10) * Math.PI
          const x1 = 100 + Math.cos(angle) * 92
          const y1 = 110 - Math.sin(angle) * 92
          const x2 = 100 + Math.cos(angle) * 86
          const y2 = 110 - Math.sin(angle) * 86
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D8DED9" strokeWidth="2" strokeLinecap="round" />
        })}
        {/* track */}
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="#EDF1EC"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* value arc */}
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke={band.color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute top-[52%] -translate-y-1/2 flex flex-col items-center">
        <span className="font-mono font-bold text-4xl text-ink-900 tabular-nums">{aqi}</span>
        <span className="text-[11px] uppercase tracking-wider text-ink-500 mt-0.5">AQI Index</span>
      </div>
    </div>
  )
}
