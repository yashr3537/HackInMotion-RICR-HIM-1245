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

const trendData = { '24h': [], '7d': [], '30d': [] }
const trendStats = { avgAqi: 0, peakAqi: 0, cleanestWindow: 'No data yet' }

const RANGES = [
  { key: '24h', label: '24 Hours' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
]

const TREND_META = {
  improving: {
    icon: TrendingDown,
    label: 'Improving',
    color: '#166B3E',
    bg: '#E6F7EC',
  },
  worsening: {
    icon: TrendingUp,
    label: 'Worsening',
    color: '#D8492E',
    bg: '#FBE2DC',
  },
  stable: {
    icon: Minus,
    label: 'Stable',
    color: '#5C6B62',
    bg: '#F1F4F2',
  },
}

function MiniTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-white/10 bg-ink-900 px-3.5 py-3 text-xs text-white shadow-lift">
      <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/45">
        {label}
      </p>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="flex items-center gap-2"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />

          <span className="font-mono font-semibold">
            {item.name || item.dataKey}: {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function MiniChart({
  data,
  dataKey,
  color,
  label,
  unit = 'AQI',
  range,
}) {
  const gradientId = `history-${dataKey}-${range}`

  return (
    <div className="card-hover card-glow relative overflow-hidden rounded-xl2 border border-ink-100 bg-surface p-5 shadow-soft sm:p-6">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
        style={{
          backgroundColor: color,
          opacity: 0.05,
        }}
      />

      <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${color}12`,
              }}
            >
              <Activity
                size={16}
                style={{ color }}
              />
            </div>

            <div>
              <h3 className="font-display text-base font-semibold text-ink-900 sm:text-lg">
                {label}
              </h3>

              <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-400">
                Historical trend
              </p>
            </div>
          </div>
        </div>

        <span
          className="rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]"
          style={{
            color,
            backgroundColor: `${color}0C`,
            borderColor: `${color}20`,
          }}
        >
          {unit}
        </span>
      </div>

      <div
        className="chart-enter relative z-10"
        style={{
          width: '100%',
          height: 220,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={`${dataKey}-${range}`}
            data={data}
            margin={{
              top: 10,
              right: 8,
              left: -18,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={color}
                  stopOpacity={0.28}
                />

                <stop
                  offset="65%"
                  stopColor={color}
                  stopOpacity={0.08}
                />

                <stop
                  offset="100%"
                  stopColor={color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 6"
              stroke="#EDF1EC"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{
                fontSize: 10,
                fill: '#5C6B62',
              }}
              axisLine={{
                stroke: '#EDF1EC',
              }}
              tickLine={false}
              interval={data.length > 12 ? 4 : 0}
            />

            <YAxis
              tick={{
                fontSize: 10,
                fill: '#5C6B62',
              }}
              axisLine={false}
              tickLine={false}
              width={32}
            />

            <Tooltip
              cursor={{
                stroke: '#D8DED9',
                strokeDasharray: '4 4',
              }}
              content={<MiniTooltip />}
            />

            <Area
              type="monotone"
              dataKey={dataKey}
              name={label}
              stroke={color}
              strokeWidth={2.6}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: color,
                stroke: '#FFFFFF',
                strokeWidth: 3,
              }}
              animationDuration={900}
              animationEasing="ease-out"
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="relative z-10 mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
        <span className="text-[10px] uppercase tracking-[0.12em] text-ink-400">
          {range === '24h'
            ? 'Last 24 hours'
            : range === '7d'
              ? 'Last 7 days'
              : 'Last 30 days'}
        </span>

        <span
          className="text-[10px] font-semibold"
          style={{ color }}
        >
          Live historical view
        </span>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const [range, setRange] = useState('7d')
  const [visible, setVisible] = useState(false)

  const data = trendData[range]
  const stats = trendStats[range]

  /*
    trendStats may expose a direction in future versions.
    The fallback keeps the current project compatible.
  */
  const trendDirection =
    stats?.direction ||
    (stats.changePercent < 0
      ? 'improving'
      : stats.changePercent > 0
        ? 'worsening'
        : 'stable')

  const meta =
    TREND_META[trendDirection] || TREND_META.stable

  const TrendIcon = meta.icon

  const average = useMemo(
    () => Number(stats?.avg || 0),
    [stats],
  )

  const rangeLabel =
    RANGES.find((item) => item.key === range)?.label || '7 Days'

  useEffect(() => {
    setVisible(false)

    const timer = window.setTimeout(() => {
      setVisible(true)
    }, 70)

    return () => window.clearTimeout(timer)
  }, [range])

  return (
    <div className="page-enter flex flex-col gap-7 pb-8 sm:gap-9">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <section className="fade-down">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
              <BarChart3 size={12} />
              Environmental history
            </div>

            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
              Air Quality History
            </h1>

            <p className="mt-2 text-sm leading-6 text-ink-500 sm:text-base">
              Historical air-quality analytics and pollutant trends for
              {` Bhopal`}.
            </p>
          </div>

          {/* Range selector */}
          <div className="flex w-fit items-center gap-1 rounded-xl border border-ink-100 bg-ink-50 p-1">
            {RANGES.map((item) => {
              const active = range === item.key

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRange(item.key)}
                  className={`relative overflow-hidden rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${
                    active
                      ? 'bg-white text-forest-800 shadow-sm'
                      : 'text-ink-500 hover:bg-white/70 hover:text-ink-700'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 bg-forest-50/60" />
                  )}

                  <span className="relative z-10">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          CURRENT RANGE STATUS
      ====================================================== */}
      <section
        className={`transition-all duration-700 ${
          visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-3 opacity-0'
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-surface p-5 shadow-soft sm:p-6">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl"
            style={{
              backgroundColor: meta.color,
              opacity: 0.06,
            }}
          />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: meta.bg,
                  color: meta.color,
                }}
              >
                <TrendIcon size={18} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">
                    {rangeLabel} overview
                  </p>

                  <span
                    className="rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]"
                    style={{
                      color: meta.color,
                      backgroundColor: meta.bg,
                      borderColor: `${meta.color}25`,
                    }}
                  >
                    {meta.label}
                  </span>
                </div>

                <p className="mt-1 text-xs leading-5 text-ink-500">
                  Air quality is currently showing a{' '}
                  {meta.label.toLowerCase()} pattern across the selected
                  period.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  Selected period
                </p>

                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {rangeLabel}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  Average AQI
                </p>

                <p className="mt-1 font-mono text-xl font-bold text-ink-900">
                  {average}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}
      <section className="stagger-children grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card-hover">
          <StatCard
            label="Average AQI"
            value={stats.avg}
            accent
          />
        </div>

        <div className="card-hover">
          <StatCard
            label="Best AQI"
            value={stats.best}
          />
        </div>

        <div className="card-hover">
          <StatCard
            label="Worst AQI"
            value={stats.worst}
          />
        </div>

        <div className="card-hover">
          <StatCard
            label="Trend"
            value={`${stats.changePercent > 0 ? '+' : ''}${stats.changePercent}%`}
          />
        </div>
      </section>

      {/* =====================================================
          MAIN AQI CHART
      ====================================================== */}
      <section
        className={`transition-all duration-700 ${
          visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-3 opacity-0'
        }`}
      >
        <MiniChart
          data={data}
          dataKey="aqi"
          color="#166B3E"
          label="AQI Trend"
          unit="AQI"
          range={range}
        />
      </section>

      {/* =====================================================
          POLLUTANT TRENDS
      ====================================================== */}
      <section>
        <div className="fade-up mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-forest-700">
            Pollutant history
          </p>

          <h2 className="mt-1 font-display text-lg font-semibold text-ink-900 sm:text-xl">
            How pollutant levels are changing
          </h2>
        </div>

        <div className="stagger-children grid gap-5 lg:grid-cols-2">
          <MiniChart
            data={data}
            dataKey="pm25"
            color="#0D8A82"
            label="PM2.5 Trend"
            unit="PM2.5"
            range={range}
          />

          <MiniChart
            data={data}
            dataKey="pm10"
            color="#D6A70C"
            label="PM10 Trend"
            unit="PM10"
            range={range}
          />
        </div>
      </section>

      {/* =====================================================
          READING CONTEXT
      ====================================================== */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-forest-400/10 blur-3xl float-soft" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 shadow-sm">
              <Wind size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900">
                Reading your historical air data
              </p>

              <p className="mt-1 text-xs leading-6 text-ink-600">
                Historical trends show how conditions changed across the
                selected period. They provide context, but do not guarantee
                future air quality conditions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}