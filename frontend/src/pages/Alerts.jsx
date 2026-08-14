import { useMemo, useState } from 'react'
import {
  Settings2,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowUpRight,
  ShieldCheck,
  Activity,
} from 'lucide-react'

import AlertCard from '../components/AlertCard'
import { EmptyState } from '../components/EmptyState'

const initialAlerts = []

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
]

const SEVERITY_META = {
  critical: {
    label: 'Critical',
    icon: AlertTriangle,
    color: '#D8492E',
    bg: '#FBE2DC',
  },

  warning: {
    label: 'Warning',
    icon: BellRing,
    color: '#D6A70C',
    bg: '#FBF3D9',
  },

  info: {
    label: 'Information',
    icon: Info,
    color: '#166B3E',
    bg: '#E6F7EC',
  },
}

export default function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [filter, setFilter] = useState('all')

  const unreadCount = useMemo(
    () => alerts.filter((alert) => !alert.read).length,
    [alerts],
  )

  const criticalCount = useMemo(
    () =>
      alerts.filter(
        (alert) => alert.severity === 'critical',
      ).length,
    [alerts],
  )

  const warningCount = useMemo(
    () =>
      alerts.filter(
        (alert) => alert.severity === 'warning',
      ).length,
    [alerts],
  )

  const filtered = useMemo(
    () =>
      alerts.filter((alert) => {
        if (filter === 'unread') return !alert.read
        if (filter === 'read') return alert.read
        return true
      }),
    [alerts, filter],
  )

  function markAllRead() {
    setAlerts((prev) =>
      prev.map((alert) => ({
        ...alert,
        read: true,
      })),
    )
  }

  return (
    <div className="page-enter flex flex-col gap-7 pb-8 sm:gap-9">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <section className="fade-down">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
              <BellRing size={12} />
              Environmental notifications
            </div>

            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
              Your Air Alerts
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-500 sm:text-base">
              Stay informed when air quality in your saved locations
              crosses a risk threshold.
            </p>
          </div>

          <div className="stagger-children flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="btn-premium inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink-700 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 size={15} />
              Mark all read
            </button>

            <button
              type="button"
              className="btn-premium inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink-800 hover:border-forest-200 hover:text-forest-800"
            >
              <Settings2 size={15} />
              Alert Settings
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}
      <section className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
            <Activity size={12} />
            Total
          </div>

          <div className="mt-2 font-mono text-2xl font-bold text-ink-900">
            {alerts.length}
          </div>

          <p className="mt-1 text-[10px] text-ink-500">
            Environmental alerts
          </p>
        </div>

        <div className="card-hover rounded-xl border border-ink-100 bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-400">
            <BellRing size={12} />
            Unread
          </div>

          <div className="mt-2 font-mono text-2xl font-bold text-ink-900">
            {unreadCount}
          </div>

          <p className="mt-1 text-[10px] text-ink-500">
            Need your attention
          </p>
        </div>

        <div
          className="card-hover rounded-xl border p-4 shadow-soft"
          style={{
            borderColor: 'rgba(216, 73, 46, 0.16)',
            backgroundColor: '#FBE2DC44',
          }}
        >
          <div
            className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em]"
            style={{ color: '#D8492E' }}
          >
            <AlertTriangle size={12} />
            Critical
          </div>

          <div
            className="mt-2 font-mono text-2xl font-bold"
            style={{ color: '#D8492E' }}
          >
            {criticalCount}
          </div>

          <p className="mt-1 text-[10px] text-ink-500">
            Highest priority
          </p>
        </div>

        <div
          className="card-hover rounded-xl border p-4 shadow-soft"
          style={{
            borderColor: 'rgba(214, 167, 12, 0.18)',
            backgroundColor: '#FBF3D944',
          }}
        >
          <div
            className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em]"
            style={{ color: '#D6A70C' }}
          >
            <BellRing size={12} />
            Warning
          </div>

          <div
            className="mt-2 font-mono text-2xl font-bold"
            style={{ color: '#D6A70C' }}
          >
            {warningCount}
          </div>

          <p className="mt-1 text-[10px] text-ink-500">
            Elevated conditions
          </p>
        </div>
      </section>

      {/* =====================================================
          STATUS STRIP
      ====================================================== */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-forest-400/10 blur-3xl float-soft" />

          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 shadow-sm">
                <ShieldCheck size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-ink-900">
                  Your alert system is active
                </p>

                <p className="mt-1 text-xs leading-5 text-ink-500">
                  Monitoring saved locations and notifying you when conditions
                  become significantly risky.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-forest-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-forest-800 sm:self-auto">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-600" />
              Monitoring active
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FILTERS
      ====================================================== */}
      <section className="fade-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-forest-700">
              Notification center
            </p>

            <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">
              Recent activity
            </h2>
          </div>

          <div className="flex w-fit items-center gap-1 rounded-xl border border-ink-100 bg-ink-50 p-1">
            {FILTERS.map((item) => {
              const active = filter === item.key

              const count =
                item.key === 'all'
                  ? alerts.length
                  : item.key === 'unread'
                    ? unreadCount
                    : alerts.length - unreadCount

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${
                    active
                      ? 'bg-white text-forest-800 shadow-sm'
                      : 'text-ink-500 hover:bg-white/70 hover:text-ink-700'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 bg-forest-50/50" />
                  )}

                  <span className="relative z-10">
                    {item.label}
                  </span>

                  <span
                    className={`relative z-10 min-w-5 rounded-full px-1.5 py-0.5 text-[9px] ${
                      active
                        ? 'bg-forest-100 text-forest-800'
                        : 'bg-ink-100 text-ink-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          ALERT LIST
      ====================================================== */}
      <section>
        {filtered.length === 0 ? (
          <div className="fade-up rounded-2xl border border-ink-100 bg-surface p-3">
            <EmptyState
              variant="no-alerts"
              title="No alerts here"
              description="You're all caught up. We'll notify you when a saved location's air quality changes significantly."
            />
          </div>
        ) : (
          <div className="stagger-children flex flex-col gap-3">
            {filtered.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          ALERT PREFERENCES CTA
      ====================================================== */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-surface p-6 shadow-soft sm:p-7">
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-forest-400/6 blur-3xl float-gentle" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                <Settings2 size={12} />
                Personalize your alerts
              </div>

              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink-900">
                Choose when AeroGuard should notify you.
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">
                Set a preferred AQI threshold and decide which saved locations
                should send you environmental notifications.
              </p>
            </div>

            <button
              type="button"
              className="btn-premium group inline-flex w-fit items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 hover:border-forest-200 hover:text-forest-800"
            >
              Configure alerts
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}