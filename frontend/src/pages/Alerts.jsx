import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Loader2,
  LogIn,
} from 'lucide-react'

import AlertCard from '../components/AlertCard'
import { EmptyState } from '../components/EmptyState'
import { fetchUserAlerts, markAlertReadInDb } from '../services/supabase/supabaseService'
import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
]

export default function Alerts() {
  const { t } = useLanguage()
  const { currentUser } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let isMounted = true
    async function loadAlerts() {
      if (!currentUser?.id) {
        if (isMounted) {
          setAlerts([])
          setLoading(false)
        }
        return
      }

      setLoading(true)
      const dbAlerts = await fetchUserAlerts(currentUser.id)
      if (isMounted) {
        setAlerts(dbAlerts)
        setLoading(false)
      }
    }

    loadAlerts()
    return () => {
      isMounted = false
    }
  }, [currentUser?.id])

  const unreadCount = useMemo(() => alerts.filter((alert) => !alert.read).length, [alerts])

  const criticalCount = useMemo(
    () => alerts.filter((alert) => alert.severity === 'critical').length,
    [alerts]
  )

  const filteredAlerts = useMemo(() => {
    if (filter === 'unread') return alerts.filter((alert) => !alert.read)
    if (filter === 'read') return alerts.filter((alert) => alert.read)
    return alerts
  }, [alerts, filter])

  const handleMarkRead = async (id) => {
    setAlerts((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
    await markAlertReadInDb(id)
  }

  const handleMarkAllRead = async () => {
    const unreadAlerts = alerts.filter((a) => !a.read)
    if (unreadAlerts.length === 0) return

    setAlerts((prev) => prev.map((item) => ({ ...item, read: true })))

    // Update DB in parallel
    await Promise.all(unreadAlerts.map((a) => markAlertReadInDb(a.id)))
  }

  if (!currentUser) {
    return (
      <div className="page-enter flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 mb-4">
          <BellRing size={32} />
        </div>
        <h1 className="font-display text-xl font-semibold text-ink-900">
          Please log in to view your alerts
        </h1>
        <p className="mt-2 text-sm text-ink-500 max-w-sm">
          Sign in to receive real-time air quality notifications and threshold alerts for your saved
          locations.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800 transition-colors"
        >
          <LogIn size={16} />
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="page-enter flex flex-col gap-7 pb-8 sm:gap-9">
      {/* HEADER */}
      <section className="fade-down">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
          <BellRing size={12} />
          {t('alerts.tag', { defaultValue: 'Alert Center' })}
        </div>

        <h1 className="max-w-3xl font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
          {t('alerts.title', { defaultValue: 'Environmental risk alerts' })}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
          {t('alerts.subtitle', {
            defaultValue:
              'Real-time alerts triggered when air quality at your saved locations exceeds threshold limits.',
          })}
        </p>
      </section>

      {/* STATS */}
      <section className="stagger-children grid grid-cols-3 gap-3 sm:gap-4">
        <div className="card-hover rounded-2xl border border-ink-100 bg-surface p-4 shadow-soft sm:p-5">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
            <Activity size={13} />
            Total Alerts
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-ink-900 sm:text-3xl">
            {alerts.length}
          </p>
        </div>

        <div className="card-hover rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-soft sm:p-5">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
            <BellRing size={13} />
            Unread
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-amber-900 sm:text-3xl">
            {unreadCount}
          </p>
        </div>

        <div className="card-hover rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-soft sm:p-5">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-800">
            <AlertTriangle size={13} />
            Critical
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-rose-900 sm:text-3xl">
            {criticalCount}
          </p>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="fade-up flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
        <div className="flex items-center gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                filter === item.key
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'bg-surface border border-ink-100 text-ink-600 hover:border-forest-200 hover:text-forest-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="btn-premium inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-900"
          >
            <CheckCircle2 size={14} />
            Mark all as read
          </button>
        )}
      </section>

      {/* ALERT LIST */}
      {loading ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
          <Loader2 size={28} className="animate-spin text-forest-700 mb-2" />
          <p className="text-xs text-ink-500">Loading alerts from database...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No alerts found"
          description="You currently have no environmental risk notifications for this view."
        />
      ) : (
        <section className="stagger-children flex flex-col gap-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => {
                if (!alert.read) handleMarkRead(alert.id)
              }}
              className="cursor-pointer"
            >
              <AlertCard alert={alert} onMarkRead={handleMarkRead} />
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
