import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '../components/StatCard'
import { trendData, trendStats } from '../data/demoData'

const RANGES = [
  { key: '24h', label: '24 Hours' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
]

function MiniChart({ data, dataKey, color, label }) {
  return (
    <div className="bg-surface rounded-xl2 border border-ink-100 shadow-soft p-5 sm:p-6">
      <h3 className="font-display font-semibold text-ink-900 mb-4">{label}</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="#EDF1EC" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5C6B62' }} axisLine={{ stroke: '#EDF1EC' }} tickLine={false} interval={data.length > 12 ? 4 : 0} />
            <YAxis tick={{ fontSize: 11, fill: '#5C6B62' }} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              contentStyle={{ background: '#0F1B14', border: 'none', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#D8DED9' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#grad-${dataKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const [range, setRange] = useState('7d')
  const data = trendData[range]
  const stats = trendStats[range]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink-900">History</h1>
          <p className="text-ink-500 text-sm mt-1.5">Historical air quality analytics for Bhopal.</p>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Average AQI" value={stats.avg} accent />
        <StatCard label="Best AQI" value={stats.best} />
        <StatCard label="Worst AQI" value={stats.worst} />
        <StatCard label="Trend" value={`${stats.changePercent > 0 ? '+' : ''}${stats.changePercent}%`} />
      </div>

      <MiniChart data={data} dataKey="aqi" color="#166B3E" label="AQI Trend" />
      <div className="grid lg:grid-cols-2 gap-5">
        <MiniChart data={data} dataKey="pm25" color="#0D8A82" label="PM2.5 Trend" />
        <MiniChart data={data} dataKey="pm10" color="#D6A70C" label="PM10 Trend" />
      </div>
    </div>
  )
}
