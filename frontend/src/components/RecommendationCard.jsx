import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  User,
  Footprints,
  ArrowRight,
  ShieldCheck,
  Activity,
} from 'lucide-react'

export default function RecommendationCard({ recommendation }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true)
    }, 80)

    return () => window.clearTimeout(timer)
  }, [recommendation])

  return (
    <div
      className={`card-hover card-glow group relative overflow-hidden rounded-xl2 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-700 p-6 text-white shadow-lift transition-all duration-700 sm:p-7 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0'
      }`}
    >
      {/* =====================================================
          Ambient background
      ====================================================== */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-forest-400/12 blur-3xl float-slow" />

      <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-mist-300/8 blur-3xl float-gentle" />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] environment-grid" />

      <div className="relative z-10">
        {/* ===================================================
            Header
        ==================================================== */}
        <div className="fade-down mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-100 backdrop-blur-sm">
            <Sparkles
              size={13}
              className="text-forest-200"
            />

            Your Environmental Recommendation
          </div>

          <div className="hidden items-center gap-1.5 text-[10px] text-white/45 sm:flex">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-300" />
            Personalized
          </div>
        </div>

        {/* ===================================================
            Main recommendation
        ==================================================== */}
        <div className="max-w-2xl">
          <h3
            className="text-reveal font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl"
            style={{ animationDelay: '100ms' }}
          >
            {recommendation.headline}
          </h3>

          <p
            className="fade-up mt-2.5 max-w-xl text-sm leading-6 text-forest-100/85 sm:text-[15px]"
            style={{ animationDelay: '180ms' }}
          >
            {recommendation.detail}
          </p>
        </div>

        {/* ===================================================
            Context chips
        ==================================================== */}
        <div className="stagger-children mt-6 flex flex-wrap gap-2.5">
          {/* Profile */}
          <div className="card-hover inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm backdrop-blur-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <User
                size={14}
                className="text-forest-200"
              />
            </span>

            <div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-white/40">
                Profile
              </div>

              <div className="text-xs font-medium text-white/85">
                {recommendation.profile}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="card-hover inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm backdrop-blur-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <Footprints
                size={14}
                className="text-forest-200"
              />
            </span>

            <div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-white/40">
                Activity
              </div>

              <div className="text-xs font-medium text-white/85">
                {recommendation.activity}
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="risk-pulse inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-forest-800 shadow-sm">
            <ShieldCheck
              size={14}
              className="text-forest-700"
            />

            {recommendation.verdict}
          </div>
        </div>

        {/* ===================================================
            Action area
        ==================================================== */}
        <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-white/45">
            <Activity
              size={13}
              className="text-forest-200"
            />

            <span>
              Based on current environmental conditions
            </span>
          </div>

          <Link
            to="/activity"
            className="btn-premium group/btn inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-forest-800 shadow-sm hover:bg-forest-50"
          >
            Check Activity Risk

            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover/btn:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </div>
  )
}