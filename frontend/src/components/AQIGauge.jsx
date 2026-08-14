import { useEffect, useMemo, useState } from 'react'
import { getAqiBand, aqiPercent } from '../data/aqiUtils'

export default function AQIGauge({ aqi, size = 220 }) {
  const band = getAqiBand(aqi)
  const percent = aqiPercent(aqi)

  const radius = 80
  const circumference = Math.PI * radius
  const dash = (percent / 100) * circumference

  const [displayAqi, setDisplayAqi] = useState(0)
  const [visible, setVisible] = useState(false)

  // Animate the AQI number whenever the value changes.
  useEffect(() => {
    const target = Number(aqi) || 0
    const duration = 850
    const startTime = performance.now()
    let frameId

    setDisplayAqi(0)
    setVisible(false)

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Premium ease-out curve.
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = Math.round(target * eased)

      setDisplayAqi(value)

      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      }
    }

    frameId = requestAnimationFrame(animate)

    const revealTimer = window.setTimeout(() => {
      setVisible(true)
    }, 120)

    return () => {
      cancelAnimationFrame(frameId)
      window.clearTimeout(revealTimer)
    }
  }, [aqi])

  const ticks = useMemo(() => Array.from({ length: 11 }, (_, index) => index), [])

  return (
    <div
      className={`relative flex flex-col items-center ${visible ? 'aqi-gauge-visible' : ''}`}
      style={{ width: size }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[54%] h-[58%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-all duration-1000"
        style={{
          backgroundColor: band.color,
          opacity: visible ? 0.11 : 0,
        }}
      />

      {/* Gauge container */}
      <div className="relative w-full">
        <svg
          viewBox="0 0 200 120"
          className="relative z-10 w-full overflow-visible"
          role="img"
          aria-label={`Air Quality Index ${aqi}`}
        >
          {/* =================================================
              Tick marks
          ================================================== */}
          {ticks.map((tick) => {
            const angle = Math.PI - (tick / 10) * Math.PI

            const x1 = 100 + Math.cos(angle) * 92
            const y1 = 110 - Math.sin(angle) * 92

            const x2 = 100 + Math.cos(angle) * 86
            const y2 = 110 - Math.sin(angle) * 86

            const tickDelay = `${tick * 35}ms`

            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={tick / 10 <= percent / 100 ? band.color : '#D8DED9'}
                strokeWidth="2"
                strokeLinecap="round"
                className="transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0.2,
                  transitionDelay: tickDelay,
                }}
              />
            )
          })}

          {/* =================================================
              Outer subtle glow track
          ================================================== */}
          <path
            d="M 20 110 A 80 80 0 0 1 180 110"
            fill="none"
            stroke={band.color}
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.07"
            className="transition-opacity duration-700"
            style={{
              opacity: visible ? 0.1 : 0,
            }}
          />

          {/* =================================================
              Background track
          ================================================== */}
          <path
            d="M 20 110 A 80 80 0 0 1 180 110"
            fill="none"
            stroke="#EDF1EC"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* =================================================
              Active value arc
          ================================================== */}
          <path
            d="M 20 110 A 80 80 0 0 1 180 110"
            fill="none"
            stroke={band.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={visible ? 0 : circumference}
            pathLength={circumference}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 5px ${band.color}55)`,
            }}
          />

          {/* =================================================
              Small arc highlight
          ================================================== */}
          <path
            d="M 20 110 A 80 80 0 0 1 180 110"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${Math.min(dash * 0.28, 70)} ${circumference}`}
            strokeDashoffset={-4}
            opacity={visible ? 0.65 : 0}
            className="transition-opacity duration-1000"
          />
        </svg>

        {/* ===================================================
            CENTER CONTENT
        ==================================================== */}
        <div
          className={`absolute left-1/2 top-[57%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-all duration-700 ${
            visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
        >
          <span
            className="font-mono text-4xl font-bold tabular-nums tracking-[-0.04em] text-ink-900 sm:text-[2.65rem]"
            style={{
              textShadow: `0 0 28px ${band.color}22`,
            }}
          >
            {displayAqi}
          </span>

          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500">
            AQI Index
          </span>
        </div>
      </div>

      {/* =====================================================
          STATUS
      ====================================================== */}
      <div
        className={`mt-[-4px] flex items-center gap-2 transition-all duration-700 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: band.color,
            boxShadow: `0 0 12px ${band.color}66`,
          }}
        />

        <span className="text-xs font-semibold" style={{ color: band.color }}>
          {band.label || band.name || 'Air Quality'}
        </span>
      </div>
    </div>
  )
}
