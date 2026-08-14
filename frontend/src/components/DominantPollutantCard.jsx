import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/index.jsx'
import {
  CircleDot,
  AlertTriangle,
  Activity,
  ShieldCheck,
} from 'lucide-react'

export default function DominantPollutantCard({ data }) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  const targetPercent = Math.min(
    Math.max(Number(data?.percentOfLimit) || 0, 0),
    100,
  )

  useEffect(() => {
    setVisible(false)
    setProgress(0)

    const revealTimer = window.setTimeout(() => {
      setVisible(true)
    }, 80)

    const progressTimer = window.setTimeout(() => {
      setProgress(targetPercent)
    }, 180)

    return () => {
      window.clearTimeout(revealTimer)
      window.clearTimeout(progressTimer)
    }
  }, [targetPercent, data])

  const getStatus = () => {
    if (targetPercent >= 85) {
      return {
        label: 'High Concern',
        color: '#D8492E',
        bg: '#FBE2DC',
        border: 'rgba(216, 73, 46, 0.18)',
      }
    }

    if (targetPercent >= 60) {
      return {
        label: 'Elevated',
        color: '#D6A70C',
        bg: '#FBF3D9',
        border: 'rgba(214, 167, 12, 0.18)',
      }
    }

    return {
      label: 'Within Range',
      color: '#166B3E',
      bg: '#E6F7EC',
      border: 'rgba(22, 107, 62, 0.16)',
    }
  }

  const status = getStatus()

  const { t } = useLanguage()

  return (
    <div
      className={`card-hover card-glow group relative overflow-hidden rounded-xl2 border border-ink-100 bg-surface p-6 shadow-soft transition-all duration-700 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0'
      }`}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125"
        style={{
          backgroundColor: status.color,
          opacity: visible ? 0.06 : 0,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-ink-500">
              {t('dominant.main')}
            </p>

            <p className="mt-1 text-xs text-ink-400">
              {t('dominant.currentMetric')}
            </p>
          </div>

          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]"
            style={{
              backgroundColor: status.bg,
              color: status.color,
              borderColor: status.border,
            }}
          >
            {targetPercent >= 85 ? (
              <AlertTriangle size={10} />
            ) : (
              <ShieldCheck size={10} />
            )}

            {status.label}
          </span>
        </div>

        {/* Pollutant title */}
        <div
          className="fade-up mt-6 flex items-center gap-3"
          style={{ animationDelay: '100ms' }}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2"
            style={{
              backgroundColor: status.bg,
              borderColor: status.border,
            }}
          >
            <CircleDot
              size={21}
              style={{ color: status.color }}
            />
          </div>

          <div className="min-w-0">
            <p className="font-display truncate text-2xl font-semibold tracking-tight text-ink-900">
              {data.label}
            </p>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
              <Activity size={11} />
              {t('dominant.dominantPollutant')}
            </div>
          </div>
        </div>

        {/* Description */}
        <p
          className="fade-up mt-5 text-sm leading-6 text-ink-700"
          style={{ animationDelay: '160ms' }}
        >
          {data.description}
        </p>

        {/* Percentage */}
        <div
          className="fade-up mt-6"
          style={{ animationDelay: '220ms' }}
        >
          <div className="mb-2.5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
                {t('dominant.exposureRelative')}
              </p>

              <p
                className="mt-1 font-mono text-3xl font-bold tracking-[-0.05em]"
                style={{ color: status.color }}
              >
                {targetPercent}%
              </p>
            </div>

            <div className="text-right text-[10px] text-ink-400">
              <div>{t('dominant.reference')}</div>
              <div className="mt-1 font-medium text-ink-600">
                100%
              </div>
            </div>
          </div>

          {/* Progress track */}
          <div className="relative h-3 overflow-hidden rounded-full bg-ink-100">
            {/* threshold markers */}
            <div className="pointer-events-none absolute inset-0">
              <span
                className="absolute top-0 h-full w-px bg-white/80"
                style={{ left: '60%' }}
              />

              <span
                className="absolute top-0 h-full w-px bg-white/80"
                style={{ left: '85%' }}
              />
            </div>

            <div
              className="progress-fill relative h-full rounded-full transition-[width] duration-1000 ease-out"
              style={{
                width: visible ? `${progress}%` : '0%',
                background: `linear-gradient(90deg, ${status.color}CC, ${status.color})`,
                boxShadow: `0 0 14px ${status.color}35`,
              }}
            />
          </div>

          {/* Scale */}
          <div className="mt-2 flex justify-between text-[10px] text-ink-400">
            <span>0%</span>

            <span
              className="font-medium"
              style={{ color: status.color }}
            >
              {targetPercent}% of limit
            </span>

            <span>100%</span>
          </div>
        </div>

        {/* Bottom insight */}
        <div
          className="fade-up mt-6 flex items-start gap-3 border-t border-ink-100 pt-4"
          style={{ animationDelay: '300ms' }}
        >
          <div
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: status.bg }}
          >
            {targetPercent >= 85 ? (
              <AlertTriangle
                size={14}
                style={{ color: status.color }}
              />
            ) : (
              <ShieldCheck
                size={14}
                style={{ color: status.color }}
              />
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-800">
              {targetPercent >= 85
                ? t('dominant.higherAttention')
                : targetPercent >= 60
                  ? t('dominant.monitorConditions')
                  : t('dominant.withinRange')}
            </p>
 
            <p className="mt-1 text-[11px] leading-5 text-ink-500">
              {t('dominant.indicatorInfo')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}