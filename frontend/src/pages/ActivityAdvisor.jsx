import { useEffect, useMemo, useState } from 'react'
import {
  Activity as ActivityIcon,
  Info,
  ShieldCheck,
  Clock3,
  Wind,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react'

import ActivityCard from '../components/ActivityCard'
import RiskBadge from '../components/RiskBadge'
import { getActivityRecommendations, getAqiCategory } from '../utils/riskEngine/riskEngine'
import { useLiveAirQuality } from '../hooks/useLiveAirQuality'
import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'

const ACTIVITIES_LIST = [
  { key: 'running', label: 'Running', icon: 'running' },
  { key: 'cycling', label: 'Cycling', icon: 'cycling' },
  { key: 'walking', label: 'Walking', icon: 'walking' },
  { key: 'sports', label: 'Outdoor Sports', icon: 'sports' },
  { key: 'work', label: 'Outdoor Work', icon: 'work' },
]

export default function ActivityAdvisor() {
  const { t } = useLanguage()
  const { currentUser } = useAuth()
  const { data: liveData, loading } = useLiveAirQuality()
  const [selected, setSelected] = useState('running')
  const [visible, setVisible] = useState(false)

  const currentAqi = liveData?.aqi ?? 82
  const profileType = currentUser?.profileType || 'general'

  const activityRecommendations = useMemo(() => {
    return getActivityRecommendations(currentAqi, profileType)
  }, [currentAqi, profileType])

  const result = activityRecommendations[selected] || {
    risk: 'moderate',
    verdict: 'Use caution',
    reason: 'Monitor environmental air quality during outdoor activity.',
  }

  const activity = ACTIVITIES_LIST.find((item) => item.key === selected)
  const category = getAqiCategory(currentAqi)
  const selectedActivityLabel = activity?.label || 'Selected activity'

  const recommendationText = useMemo(() => {
    if (result.risk === 'good') {
      return 'Current conditions are highly suitable for outdoor activity.'
    }
    if (result.risk === 'moderate') {
      return 'Reasonable with caution; keep outdoor sessions moderate in duration.'
    }
    if (result.risk === 'sensitive') {
      return 'Sensitive groups should limit duration or switch to indoor alternatives.'
    }
    return 'Consider delaying outdoor activity or exercising indoors.'
  }, [result])

  useEffect(() => {
    setVisible(false)
    const timer = window.setTimeout(() => setVisible(true), 80)
    return () => window.clearTimeout(timer)
  }, [selected])

  return (
    <div className="page-enter flex flex-col gap-7 pb-8 sm:gap-9">
      {/* HEADER */}
      <section className="fade-down">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
          <Sparkles size={12} />
          {t('advisor.tag', { defaultValue: 'Activity Risk Advisor' })}
        </div>

        <h1 className="max-w-3xl font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
          {t('advisor.title', { defaultValue: 'Can I do this activity right now?' })}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
          {t('advisor.subtitle', { defaultValue: 'Select an outdoor activity to analyze real-time environmental risk based on your location and health profile.' })}
        </p>
      </section>

      {/* ACTIVITY SELECTOR */}
      <section>
        <div className="fade-up mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-forest-700">
              Choose an activity
            </p>

            <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">
              What are you planning to do?
            </h2>
          </div>

          <div className="hidden items-center gap-2 text-xs text-ink-400 sm:flex">
            <ActivityIcon size={13} />
            {ACTIVITIES_LIST.length} activities
          </div>
        </div>

        <div className="stagger-children grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
          {ACTIVITIES_LIST.map((item) => (
            <ActivityCard
              key={item.key}
              activity={item}
              selected={selected === item.key}
              onSelect={setSelected}
            />
          ))}
        </div>
      </section>

      {/* RESULT CARD */}
      <section
        className={`transition-all duration-700 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="card-hover card-glow relative overflow-hidden rounded-[28px] border border-ink-100 bg-surface shadow-card">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: category.color }}
          />

          <div className="relative z-10 p-6 sm:p-8 lg:p-9">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-ink-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  <ActivityIcon size={12} />
                  {selectedActivityLabel}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <RiskBadge aqi={currentAqi} size="lg" />

                  <span className="hidden h-1 w-1 rounded-full bg-ink-300 sm:block" />

                  <span className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">
                    {result.verdict}
                  </span>
                </div>

                <p className="mt-3 text-sm font-medium" style={{ color: category.color }}>
                  AQI: {currentAqi} — {category.label}
                </p>
              </div>

              <div
                className="inline-flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"
                style={{
                  color: category.color,
                  backgroundColor: category.bg,
                  borderColor: `${category.color}25`,
                }}
              >
                {loading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <span className="live-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                )}
                {liveData?.name ? `Live data for ${liveData.name}` : 'Live AQI conditions'}
              </div>
            </div>

            {/* MAIN REASON GRID */}
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-ink-100 bg-ink-50/55 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: category.bg, color: category.color }}
                  >
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-400">
                      Why this recommendation?
                    </p>

                    <p className="mt-2 text-sm leading-6 text-ink-700">
                      {result.reason}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl border p-5 sm:p-6"
                style={{
                  backgroundColor: `${category.color}06`,
                  borderColor: `${category.color}30`,
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-400">
                  What this means
                </p>

                <p className="mt-2 text-sm font-semibold text-ink-900">
                  {recommendationText}
                </p>

                <div className="mt-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-ink-600">
                    <Clock3 size={13} />
                    Adjust outdoor duration according to AQI level
                  </div>

                  <div className="flex items-center gap-2 text-xs text-ink-600">
                    <Wind size={13} />
                    Check live AQI updates before exercising
                  </div>

                  <div
                    className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ backgroundColor: category.bg, color: category.color }}
                  >
                    Personalized Profile: {profileType}
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* INFO */}
            <div className="mt-7 flex items-start gap-2.5 rounded-xl border border-ink-100 bg-white/70 px-4 py-3">
              <Info size={15} className="mt-0.5 shrink-0 text-ink-500" />
              <p className="text-xs leading-5 text-ink-500">
                This environmental recommendation is calculated using live Open-Meteo AQI measurements. Individual responses to air pollution vary.
              </p>
            </div>
          </div>

          <div
            className="relative z-10 border-t px-6 py-3.5 sm:px-8"
            style={{
              borderColor: `${category.color}20`,
              backgroundColor: `${category.color}05`,
            }}
          >
            <div className="flex flex-col gap-2 text-[10px] sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium uppercase tracking-[0.12em] text-ink-400">
                Activity risk updated dynamically with live measurements
              </span>
              <span className="font-semibold" style={{ color: category.color }}>
                {selectedActivityLabel}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}