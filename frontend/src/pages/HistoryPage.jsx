import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Activity,
  CalendarDays,
  TrendingDown,
  TrendingUp,
  Minus,
  BarChart3,
  Wind,
} from 'lucide-react'

import StatCard from '../components/StatCard'
import { fetchHistoricalSnapshots } from '../services/supabase/supabaseService'
import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'

const RANGES = [
  { key: '24h', label: '24 Hours' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
]

function generateFallbackHistory(rangeKey) {
  const hoursLabels = ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm']
  const daysLabels7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const daysLabels30 = Array.from({ length: 30 }, (_, i) => `${i + 1}`)

  if (rangeKey === '7d') {
    const seed7 = [74, 81, 88, 95, 90, 79, 82]
    return {
      snapshots: daysLabels7.map((label, i) => ({ label, aqi: seed7[i], pm25: Math.round(seed7[i] * 0.34), pm10: Math.round(seed7[i] * 0.66) })),
      stats: { avg: 84, best: 74, worst: 95, changePercent: -6 },
      trendDirection: 'improving',
    }
  }
  if (rangeKey === '30d') {
    const seed30 = [95, 92, 88, 84, 90, 96, 101, 98, 93, 87, 82, 79, 84, 90, 95, 99, 93, 88, 82, 78, 75, 79, 84, 88, 92, 87, 81, 76, 79, 82]
    return {
      snapshots: daysLabels30.map((label, i) => ({ label, aqi: seed30[i], pm25: Math.round(seed30[i] * 0.34), pm10: Math.round(seed30[i] * 0.66) })),
      stats: { avg: 87, best: 75, worst: 101, changePercent: -11 },
      trendDirection: 'improving',
    }
  }

  const seed24 = [58, 52, 48, 46, 55, 68, 79, 88, 92, 85, 74, 62]
  return {
    snapshots: hoursLabels.map((label, i) => ({ label, aqi: seed24[i], pm25: Math.round(seed24[i] * 0.34), pm10: Math.round(seed24[i] * 0.66) })),
    stats: { avg: 67, best: 46, worst: 92, changePercent: -8 },
    trendDirection: 'improving',
  }
}

export default function HistoryPage() {
  const { t } = useLanguage()
  const { currentUser } = useAuth()
  const [range, setRange] = useState('24h')
  const [dbData, setDbData] = useState(null)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      if (currentUser?.id) {
        const result = await fetchHistoricalSnapshots(currentUser.id, null, range)
        if (isMounted && result) {
          setDbData(result)
          return
        }
      }
      if (isMounted) setDbData(null)
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [currentUser?.id, range])

  const historyData = useMemo(() => {
    if (dbData?.snapshots && dbData.snapshots.length > 0) {
      return dbData
    }
    return generateFallbackHistory(range)
  }, [dbData, range])

  const stats = historyData.stats
  const chartData = historyData.snapshots

  return (
    <div className="page-enter flex flex-col gap-7 pb-8 sm:gap-9">
      <section className="fade-down">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
          <CalendarDays size={12} />
          {t('history.tag', { defaultValue: 'Historical Records' })}
        </div>

        <h1 className="max-w-3xl font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
          {t('history.title', { defaultValue: 'Air Quality Trends over Time' })}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
          {t('history.subtitle', { defaultValue: 'Track environmental snapshots, compare average AQI levels, and see whether air quality is improving.' })}
        </p>
      </section>

      {/* STATS */}
      <section className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard title="Average AQI" value={stats.avg} icon={Activity} />
        <StatCard title="Best Reading" value={stats.best} icon={TrendingDown} />
        <StatCard title="Worst Reading" value={stats.worst} icon={TrendingUp} />
        <StatCard title="Overall Change" value={`${stats.changePercent}%`} icon={Wind} />
      </section>

      {/* MAIN CHART */}
      <section className="fade-up">
        <div className="rounded-2xl border border-ink-100 bg-surface p-5 shadow-card sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-ink-100 pb-5 mb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                AQI History
              </p>
              <h2 className="font-display text-lg font-semibold text-ink-900">
                Air Quality Timeline
              </h2>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-ink-100 bg-ink-50/60 p-1">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRange(r.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    range === r.key
                      ? 'bg-white text-ink-900 shadow-sm'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22A85F" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22A85F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18221E',
                    borderColor: '#18221E',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="aqi" stroke="#22A85F" strokeWidth={2.5} fillOpacity={1} fill="url(#histGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  )
}