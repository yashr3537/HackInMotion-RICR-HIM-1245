import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { trendData, trendDirection } from '../data/demoData'

const RANGES = [
  { key: '24h', label: '24 Hours' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
]

const TREND_META = {
  improving: { icon: TrendingDown, text: 'Air quality is improving', color: '#166B3E' },
  worsening: { icon: TrendingUp, text: 'Air quality is worsening', color: '#D8492E' },
  stable: { icon: Minus, text: 'Air quality is stable', color: '#5C6B62' },
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-900 text-white text-xs rounded-lg px-3 py-2 shadow-lift">
      <p className="text-ink-200 mb-0.5">{label}</p>
      <p className="font-mono font-semibold">AQI {payload[0].value}</p>
    </div>
  )
}

export default function TrendChart({ compact = false }) {
  const [range, setRange] = useState('24h')
  const data = trendData[range]
  const meta = TREND_META[trendDirection]
  const TrendIcon = meta.icon

  return (
    <div className="bg-surface rounded-xl2 border border-ink-100 shadow-soft p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h3 className="font-display font-semibold text-lg text-ink-900">Air Quality Trend</h3>
          <div className="flex items-center gap-1.5 text-sm mt-1" style={{ color: meta.color }}>
            <TrendIcon size={15} />
            <span className="font-medium">{meta.text}</span>
          </div>
        </div>
        <div className="flex bg-ink-100 rounded-lg p-1 self-start">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                range === r.key ? 'bg-white text-forest-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: compact ? 200 : 260 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22A85F" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22A85F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="#EDF1EC" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#5C6B62' }}
              axisLine={{ stroke: '#EDF1EC' }}
              tickLine={false}
              interval={data.length > 12 ? 4 : 0}
            />
            <YAxis tick={{ fontSize: 11, fill: '#5C6B62' }} axisLine={false} tickLine={false} width={32} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="aqi" stroke="#166B3E" strokeWidth={2.5} fill="url(#aqiFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
