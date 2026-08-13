import { useEffect, useMemo, useState } from 'react'
import {
  Activity as ActivityIcon,
  Info,
  ShieldCheck,
  Clock3,
  Wind,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

import ActivityCard from '../components/ActivityCard'
import RiskBadge from '../components/RiskBadge'
import { activities, activityRiskData } from '../data/demoData'

// These values are used only to reuse the existing RiskBadge
// visual system in this UI/demo advisor.
const RISK_TO_AQI = {
  good: 35,
  moderate: 82,
  sensitive: 130,
  unhealthy: 180,
}

const RISK_META = {
  good: {
    color: '#166B3E',
    bg: '#E6F7EC',
    border: 'rgba(22, 107, 62, 0.16)',
    label: 'Lower environmental risk',
  },
  moderate: {
    color: '#D6A70C',
    bg: '#FBF3D9',
    border: 'rgba(214, 167, 12, 0.18)',
    label: 'Moderate environmental risk',
  },
  sensitive: {
    color: '#E5822A',
    bg: '#FCEADA',
    border: 'rgba(229, 130, 42, 0.18)',
    label: 'Higher sensitivity',
  },
  unhealthy: {
    color: '#D8492E',
    bg: '#FBE2DC',
    border: 'rgba(216, 73, 46, 0.18)',
    label: 'High environmental risk',
  },
}

export default function ActivityAdvisor() {
  const [selected, setSelected] = useState('running')
  const [visible, setVisible] = useState(false)

  const result = activityRiskData[selected]
  const activity = activities.find((item) => item.key === selected)

  const riskMeta =
    RISK_META[result?.risk] || RISK_META.moderate

  const riskAqi =
    RISK_TO_AQI[result?.risk] || RISK_TO_AQI.moderate

  const selectedActivityLabel =
    activity?.label || 'Selected activity'

  const activityIcon = activity?.icon

  const recommendationText = useMemo(() => {
    if (!result) return 'No recommendation available.'

    if (result.risk === 'good') {
      return 'Current conditions appear more suitable for this activity.'
    }

    if (result.risk === 'moderate') {
      return 'The activity may be reasonable with appropriate caution and shorter exposure.'
    }

    if (result.risk === 'sensitive') {
      return 'Consider reducing intensity or duration, especially for sensitive individuals.'
    }

    return 'Consider delaying the activity or choosing a lower-exposure alternative.'
  }, [result])

  useEffect(() => {
    setVisible(false)

    const timer = window.setTimeout(() => {
      setVisible(true)
    }, 80)

    return () => window.clearTimeout(timer)
  }, [selected])

  return (
    <div className="page-enter flex flex-col gap-7 pb-8 sm:gap-9">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <section className="fade-down">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
          <Sparkles size={12} />
          Activity risk advisor
        </div>

        <h1 className="max-w-3xl font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
          Can I do this activity right now?
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
          Select an activity to understand how current environmental
          conditions may affect the activity.
        </p>
      </section>

      {/* =====================================================
          ACTIVITY SELECTOR
      ====================================================== */}
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
            {activities.length} activities
          </div>
        </div>

        <div className="stagger-children grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
          {activities.map((item) => (
            <ActivityCard
              key={item.key}
              activity={item}
              selected={selected === item.key}
              onSelect={setSelected}
            />
          ))}
        </div>
      </section>

      {/* =====================================================
          RESULT CARD
      ====================================================== */}
      <section
        className={`transition-all duration-700 ${
          visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0'
        }`}
      >
        <div
          className="card-hover card-glow relative overflow-hidden rounded-[28px] border bg-surface shadow-card"
          style={{
            borderColor: riskMeta.border,
          }}
        >
          {/* Ambient risk glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
            style={{
              backgroundColor: riskMeta.color,
              opacity: 0.07,
            }}
          />

          <div className="relative z-10 p-6 sm:p-8 lg:p-9">
            {/* Top strip */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-ink-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  <ActivityIcon size={12} />
                  {selectedActivityLabel}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <RiskBadge
                    aqi={riskAqi}
                    size="lg"
                  />

                  <span className="hidden h-1 w-1 rounded-full bg-ink-300 sm:block" />

                  <span className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">
                    {result?.verdict}
                  </span>
                </div>

                <p
                  className="mt-3 max-w-xl text-sm font-medium"
                  style={{ color: riskMeta.color }}
                >
                  {riskMeta.label}
                </p>
              </div>

              {/* Right-side status */}
              <div
                className="inline-flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"
                style={{
                  color: riskMeta.color,
                  backgroundColor: riskMeta.bg,
                  borderColor: riskMeta.border,
                }}
              >
                <span
                  className="live-dot h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: riskMeta.color,
                  }}
                />
                Current conditions
              </div>
            </div>

            {/* Main grid */}
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Reason */}
              <div className="rounded-2xl border border-ink-100 bg-ink-50/55 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: riskMeta.bg,
                      color: riskMeta.color,
                    }}
                  >
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-400">
                      Why this recommendation?
                    </p>

                    <p className="mt-2 text-sm leading-6 text-ink-700">
                      {result?.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action summary */}
              <div
                className="rounded-2xl border p-5 sm:p-6"
                style={{
                  backgroundColor: `${riskMeta.color}06`,
                  borderColor: riskMeta.border,
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
                    Consider exposure duration
                  </div>

                  <div className="flex items-center gap-2 text-xs text-ink-600">
                    <Wind size={13} />
                    Check current air conditions again before starting
                  </div>

                  <div
                    className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{
                      backgroundColor: riskMeta.bg,
                      color: riskMeta.color,
                    }}
                  >
                    Activity status
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom info */}
            <div className="mt-7 flex items-start gap-2.5 rounded-xl border border-ink-100 bg-white/70 px-4 py-3">
              <Info
                size={15}
                className="mt-0.5 shrink-0 text-ink-500"
              />

              <p className="text-xs leading-5 text-ink-500">
                This is a UI/demo environmental recommendation, not medical
                advice. Individual responses to air pollution vary. Consult a
                qualified healthcare professional for guidance specific to
                your health condition.
              </p>
            </div>
          </div>

          {/* Bottom status strip */}
          <div
            className="relative z-10 border-t px-6 py-3.5 sm:px-8"
            style={{
              borderColor: riskMeta.border,
              backgroundColor: `${riskMeta.color}05`,
            }}
          >
            <div className="flex flex-col gap-2 text-[10px] sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium uppercase tracking-[0.12em] text-ink-400">
                Activity risk is based on current environmental conditions
              </span>

              <span
                className="font-semibold"
                style={{ color: riskMeta.color }}
              >
                {selectedActivityLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          HELPFUL CONTEXT
      ====================================================== */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-forest-400/10 blur-3xl float-soft" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 shadow-sm">
              <Info size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900">
                A better outdoor decision starts with current data.
              </p>

              <p className="mt-1 text-xs leading-6 text-ink-600">
                Use this advisor together with the live AQI, pollutant levels,
                historical trends and your saved-location alerts to make a
                more informed choice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}