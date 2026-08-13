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
  TrendingDown,
  TrendingUp,
  Minus,
  Activity,
  CalendarDays,
} from 'lucide-react'
import { trendData, trendDirection } from '../data/demoData'

const RANGES = [
  { key: '24h', label: '24 Hours' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
]

const TREND_META = {
  improving: {
    icon: TrendingDown,
    text: 'Air quality is improving',
    color: '#166B3E',
    bg: '#EAF7EF',
  },
  worsening: {
    icon: TrendingUp,
    text: 'Air quality is worsening',
    color: '#D8492E',
    bg: '#FCEBE7',
  },
  stable: {
    icon: Minus,
    text: 'Air quality is stable',
    color: '#5C6B62',
    bg: '#F1F4F2',
  },
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-white/10 bg-ink-900 px-3.5 py-3 text-xs text-white shadow-lift backdrop-blur-xl">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
        {label}
      </p>

      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-forest-400" />
        <p className="font-mono font-semibold">
          AQI {payload[0].value}
        </p>
      </div>
    </div>
  )
}

export default function TrendChart({ compact = false }) {
  const [range, setRange] = useState('24h')
  const [visible, setVisible] = useState(false)

  const data = trendData[range]
  const meta = TREND_META[trendDirection]
  const TrendIcon = meta.icon

  const latestAqi = useMemo(() => {
    if (!data?.length) return 0
    return data[data.length - 1]?.aqi ?? 0
  }, [data])

  const firstAqi = useMemo(() => {
    if (!data?.length) return 0
    return data[0]?.aqi ?? 0
  }, [data])

  const change = useMemo(() => {
    if (!firstAqi) return 0
    return Math.round(((latestAqi - firstAqi) / firstAqi) * 100)
  }, [firstAqi, latestAqi])

  useEffect(() => {
    setVisible(false)

    const timer = window.setTimeout(() => {
      setVisible(true)
    }, 60)

    return () => window.clearTimeout(timer)
  }, [range])

  const chartHeight = compact ? 200 : 260

  return (
    <div
      className={`card-hover card-glow relative overflow-hidden rounded-xl2 border border-ink-100 bg-surface p-5 shadow-soft transition-all duration-700 sm:p-6 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-3 opacity-0'
      }`}
    >
      {/* Ambient chart glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-forest-400/6 blur-3xl" />

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="relative z-10 mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
              <Activity size={17} />
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold text-ink-900">
                Air Quality Trend
              </h3>

              <div
                className="mt-1 flex items-center gap-1.5 text-sm"
                style={{ color: meta.color }}
              >
                <TrendIcon
                  size={15}
                  className="transition-transform duration-300"
                />
                <span className="font-medium">{meta.text}</span>
              </div>
            </div>
          </div>
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
                className={`relative overflow-hidden rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                  active
                    ? 'bg-white text-forest-800 shadow-sm'
                    : 'text-ink-500 hover:bg-white/60 hover:text-ink-700'
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-lg bg-forest-50/60" />
                )}

                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* =====================================================
          TREND SUMMARY
      ====================================================== */}
      {!compact && (
        <div className="relative z-10 mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-ink-100 bg-ink-50/70 p-3.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-400">
              <Activity size={11} />
              Latest
            </div>

            <div className="mt-1.5 font-mono text-xl font-bold tracking-tight text-ink-900">
              {latestAqi}
            </div>

            <div className="mt-0.5 text-[10px] text-ink-500">
              AQI
            </div>
          </div>

          <div className="rounded-xl border border-ink-100 bg-ink-50/70 p-3.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-400">
              <TrendingDown size={11} />
              Change
            </div>

            <div
              className="mt-1.5 font-mono text-xl font-bold tracking-tight"
              style={{ color: meta.color }}
            >
              {change > 0 ? '+' : ''}
              {change}%
            </div>

            <div className="mt-0.5 text-[10px] text-ink-500">
              Across selected period
            </div>
          </div>

          <div className="col-span-2 rounded-xl border border-ink-100 bg-ink-50/70 p-3.5 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-400">
              <CalendarDays size={11} />
              Period
            </div>

            <div className="mt-1.5 text-base font-semibold text-ink-900">
              {RANGES.find((item) => item.key === range)?.label}
            </div>

            <div className="mt-0.5 text-[10px] text-ink-500">
              Historical overview
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CHART
      ====================================================== */}
      <div
        className={`chart-enter relative z-10 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          width: '100%',
          height: chartHeight,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={range}
            data={data}
            margin={{
              top: 12,
              right: 8,
              left: -18,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id={`aqiFill-${range}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={meta.color}
                  stopOpacity={0.30}
                />

                <stop
                  offset="65%"
                  stopColor={meta.color}
                  stopOpacity={0.08}
                />

                <stop
                  offset="100%"
                  stopColor={meta.color}
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
                fontSize: 11,
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
                fontSize: 11,
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
              content={<CustomTooltip />}
            />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke={meta.color}
              strokeWidth={2.7}
              fill={`url(#aqiFill-${range})`}
              fillOpacity={1}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 3,
                stroke: '#FFFFFF',
                fill: meta.color,
              }}
              animationDuration={900}
              animationEasing="ease-out"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* =====================================================
          FOOTER INSIGHT
      ====================================================== */}
      <div className="relative z-10 mt-4 flex items-center justify-between gap-4 border-t border-ink-100 pt-4">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: meta.color,
              boxShadow: `0 0 9px ${meta.color}55`,
            }}
          />

          <span className="text-xs text-ink-500">
            {meta.text}
          </span>
        </div>

        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-400">
          Historical data
        </span>
      </div>
    </div>
  )
}