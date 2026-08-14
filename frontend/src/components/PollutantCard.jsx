import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../i18n/index.jsx'
import { Wind, CircleDot, Cloud, Sun, FlaskConical, Flame, Activity } from 'lucide-react'

const ICONS = {
  pm25: CircleDot,
  pm10: Cloud,
  no2: FlaskConical,
  o3: Sun,
  so2: Flame,
  co: Wind,
}

const STATUS_COLORS = {
  good: {
    color: '#22A85F',
    bg: '#E6F7EC',
    softBg: 'rgba(34, 168, 95, 0.10)',
    border: 'rgba(34, 168, 95, 0.18)',
  },
  moderate: {
    color: '#D6A70C',
    bg: '#FBF3D9',
    softBg: 'rgba(214, 167, 12, 0.10)',
    border: 'rgba(214, 167, 12, 0.18)',
  },
  sensitive: {
    color: '#E5822A',
    bg: '#FCEADA',
    softBg: 'rgba(229, 130, 42, 0.10)',
    border: 'rgba(229, 130, 42, 0.18)',
  },
  unhealthy: {
    color: '#E35D3E',
    bg: '#FCE8E3',
    softBg: 'rgba(227, 93, 62, 0.10)',
    border: 'rgba(227, 93, 62, 0.18)',
  },
  hazardous: {
    color: '#B92E3D',
    bg: '#F8DDE1',
    softBg: 'rgba(185, 46, 61, 0.10)',
    border: 'rgba(185, 46, 61, 0.18)',
  },
}

/*
  Pollutant values do not map directly to the AQI 0–300 scale.
  This helper creates a visual relative level for the progress bar.
  It is intentionally presentation-only and does not replace
  the application's actual risk classification logic.
*/
const getVisualPercent = (value) => {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 0
  }

  return Math.min((numericValue / 150) * 100, 100)
}

// status labels will be provided via translations inside the component

export default function PollutantCard({ pollutant }) {
  const { t } = useLanguage()
  const Icon = ICONS[pollutant.key] || Wind
  const tint = STATUS_COLORS[pollutant.status] || STATUS_COLORS.good

  const targetValue = Number(pollutant.value)
  const visualPercent = useMemo(() => getVisualPercent(targetValue), [targetValue])

  const [displayValue, setDisplayValue] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const numericTarget = Number.isFinite(targetValue) ? targetValue : 0

    const duration = 700
    const startTime = performance.now()

    let frameId

    const animateValue = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      const easedProgress = 1 - Math.pow(1 - progress, 3)

      setDisplayValue(Number((numericTarget * easedProgress).toFixed(1)))

      if (progress < 1) {
        frameId = requestAnimationFrame(animateValue)
      }
    }

    setDisplayValue(0)
    setVisible(false)

    frameId = requestAnimationFrame(animateValue)

    const revealTimer = window.setTimeout(() => {
      setVisible(true)
    }, 80)

    return () => {
      cancelAnimationFrame(frameId)
      window.clearTimeout(revealTimer)
    }
  }, [targetValue])

  return (
    <div
      className={`card-hover card-glow group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-surface p-4 shadow-soft transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
      style={{
        borderColor: tint.border,
      }}
    >
      {/* Soft status glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-all duration-500 group-hover:scale-125"
        style={{
          backgroundColor: tint.color,
          opacity: visible ? 0.08 : 0,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Icon */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2"
          style={{
            backgroundColor: tint.bg,
            borderColor: tint.border,
          }}
        >
          <Icon
            size={18}
            strokeWidth={2.1}
            style={{ color: tint.color }}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Live status */}
        <div className="flex items-center gap-2">
          <span
            className="relative flex h-2.5 w-2.5 items-center justify-center"
            aria-hidden="true"
          >
            <span
              className="absolute h-2.5 w-2.5 animate-ping rounded-full"
              style={{
                backgroundColor: tint.color,
                opacity: 0.28,
              }}
            />

            <span
              className="relative h-2 w-2 rounded-full"
              style={{
                backgroundColor: tint.color,
                boxShadow: `0 0 8px ${tint.color}70`,
              }}
            />
          </span>

          <span
            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: tint.color }}
          >
            {t('common.live')}
          </span>
        </div>
      </div>

      {/* Main value */}
      <div className="relative z-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-ink-500">{pollutant.label}</p>

            <div className="mt-1 flex items-baseline">
              <span
                className="font-mono text-2xl font-bold tracking-[-0.04em] text-ink-900 tabular-nums"
                style={{
                  textShadow: `0 0 18px ${tint.color}10`,
                }}
              >
                {displayValue}
              </span>

              <span className="ml-1.5 text-xs font-normal text-ink-500">{pollutant.unit}</span>
            </div>
          </div>

          <div
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: tint.softBg,
              color: tint.color,
              border: `1px solid ${tint.border}`,
            }}
          >
            {t(`aqi.${pollutant.status}`)}
          </div>
        </div>
      </div>

      {/* Progress / visual level */}
      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-400">
            {t('pollutant.relativeLevel')}
          </span>

          <span className="text-[10px] font-semibold tabular-nums" style={{ color: tint.color }}>
            {Math.round(visualPercent)}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div
            className="progress-fill h-full rounded-full"
            style={{
              width: `${visualPercent}%`,
              backgroundColor: tint.color,
              boxShadow: `0 0 10px ${tint.color}35`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between border-t border-ink-100 pt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-ink-400">
          <Activity size={11} />
          {t('pollutant.environmentalMetric')}
        </div>

        <span
          className="text-[10px] font-medium transition-transform duration-300 group-hover:translate-x-0.5"
          style={{ color: tint.color }}
        >
          {t('common.monitoring')}
        </span>
      </div>
    </div>
  )
}
