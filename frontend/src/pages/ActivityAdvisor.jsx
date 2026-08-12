import { useState } from 'react'
import { Info } from 'lucide-react'
import ActivityCard from '../components/ActivityCard'
import RiskBadge from '../components/RiskBadge'
import { activities, activityRiskData } from '../data/demoData'

// Map risk keys used in demo data to a representative AQI value purely for
// reusing the RiskBadge color system in this UI-only advisor.
const RISK_TO_AQI = { good: 35, moderate: 82, sensitive: 130, unhealthy: 180 }

export default function ActivityAdvisor() {
  const [selected, setSelected] = useState('running')
  const result = activityRiskData[selected]
  const activity = activities.find((a) => a.key === selected)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink-900">Can I do this activity right now?</h1>
        <p className="text-ink-500 text-sm mt-1.5">Select an activity to see a risk-based recommendation for current conditions.</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
        {activities.map((a) => (
          <ActivityCard key={a.key} activity={a} selected={selected === a.key} onSelect={setSelected} />
        ))}
      </div>

      <div className="bg-surface rounded-xl2 border border-ink-100 shadow-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-3">{activity.label.toUpperCase()}</p>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <RiskBadge aqi={RISK_TO_AQI[result.risk]} size="lg" />
          <span className="text-ink-300">·</span>
          <span className="font-display font-semibold text-xl text-ink-900">{result.verdict}</span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">Reason</p>
          <p className="text-ink-700 leading-relaxed max-w-lg">{result.reason}</p>
        </div>

        <div className="flex items-start gap-2.5 mt-6 bg-ink-100/70 rounded-lg px-4 py-3">
          <Info size={15} className="text-ink-500 mt-0.5 shrink-0" />
          <p className="text-xs text-ink-500 leading-relaxed">
            This is a UI/demo recommendation only, not medical advice. Consult a healthcare professional for guidance
            specific to your health conditions.
          </p>
        </div>
      </div>
    </div>
  )
}
