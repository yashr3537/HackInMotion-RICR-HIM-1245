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
  BarChart3,
  Wind,
  Loader2,
} from 'lucide-react'

import StatCard from '../components/StatCard'
import { fetchHistoricalSnapshots } from '../services/supabase/supabaseService'
import { getAirQualityHistory } from '../services/airQuality/airQualityApi'
import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'
import { useLiveAirQuality } from '../hooks/useLiveAirQuality'

const RANGES = [
  { key: '24h', label: '24 Hours' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
]

export default function HistoryPage() {
  const { t } = useLanguage()
  const { currentUser } = useAuth()
  const { data: currentLocation, loading: locLoading } = useLiveAirQuality()

  const [range, setRange] = useState('24h')
  const [historyData, setHistoryData] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Fetch real historical AQI data for current live location & time range
  useEffect(() => {
    if (!currentLocation?.latitude || !currentLocation?.longitude) return
    let isMounted = true
    setLoadingHistory(true)

    async function loadData() {
      try {
        // Fetch full multi-point real historical AQI data from Open-Meteo for current location
        let result = await getAirQualityHistory(
          currentLocation.latitude,
          currentLocation.longitude,
          range
        )

        // Fallback to Supabase recorded snapshots if API call returns empty
        if (!result || !result.snapshots || result.snapshots.length === 0) {
          result = await fetchHistoricalSnapshots(currentUser?.id, currentLocation.name, range)
        }

        if (isMounted) {
          setHistoryData(result)
          setLoadingHistory(false)
        }
      } catch (err) {
        console.error('Error loading history data for current location:', err)
        if (isMounted) {
          setHistoryData(null)
          setLoadingHistory(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [currentUser?.id, currentLocation?.latitude, currentLocation?.longitude, currentLocation?.name, range])

  const stats = historyData?.stats || { avg: '--', best: '--', worst: '--', changePercent: 0 }
  const chartData = historyData?.snapshots || []

  const formattedChangePercent = useMemo(() => {
    if (!historyData || historyData.count < 2 || stats.changePercent === undefined) {
      return '--'
    }
    const val = Number(stats.changePercent)
    if (isNaN(val)) return '--'
    if (val > 0) return `+${val}%`
    return `${val}%`
  }, [historyData, stats.changePercent])

  const locationName = currentLocation?.name || 'Current Location'
  const locationRegion = currentLocation?.region ? `, ${currentLocation.region}` : ''

  return (
    <div className="page-enter flex flex-col gap-7 pb-8 sm:gap-9">
      {/* HEADER */}
      <section className="fade-down">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
          <CalendarDays size={12} />
          {t('history.tag', { defaultValue: 'Historical Records' })}
        </div>

        <h1 className="max-w-3xl font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
          {t('history.title', { defaultValue: 'Air Quality Trends over Time' })}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
          Real-time environmental timeline for <strong className="text-ink-900 font-semibold">{locationName}</strong>{locationRegion}.
        </p>
      </section>

      {/* STATS CARDS */}
      <section className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard title="Average AQI" value={stats.avg} icon={Activity} />
        <StatCard title="Best Reading" value={stats.best} icon={TrendingDown} />
        <StatCard title="Worst Reading" value={stats.worst} icon={TrendingUp} />
        <StatCard title="Overall Change" value={formattedChangePercent} icon={Wind} />
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
                Air Quality Timeline — {locationName}
              </h2>
            </div>

            {/* TIME RANGE SELECTOR */}
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

          <div className="h-72 sm:h-80 w-full flex flex-col justify-center">
            {locLoading || loadingHistory ? (
              <div className="flex flex-col items-center justify-center gap-2 text-ink-400 py-12">
                <Loader2 size={24} className="animate-spin text-forest-600" />
                <span className="text-xs font-medium">Fetching real-time AQI timeline for {locationName}...</span>
              </div>
            ) : !historyData || chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <BarChart3 size={32} className="text-ink-300 mb-3" />
                <p className="font-display font-semibold text-ink-800 text-base">
                  No historical data available for {locationName}
                </p>
                <p className="mt-1 text-xs text-ink-500 max-w-md leading-relaxed">
                  Unable to load historical AQI points for this location at the moment.
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </section>
    </div>
  )
}