import { CircleDot } from 'lucide-react'

export default function DominantPollutantCard({ data }) {
  return (
    <div className="bg-surface rounded-xl2 border border-ink-100 shadow-soft p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-4">Main Pollutant Concern</p>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-lg bg-forest-100 flex items-center justify-center">
          <CircleDot size={20} className="text-forest-700" />
        </div>
        <p className="font-display font-semibold text-2xl text-ink-900">{data.label}</p>
      </div>
      <p className="text-sm text-ink-700 leading-relaxed mb-4">{data.description}</p>
      <div className="w-full h-2.5 bg-ink-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-forest-500 to-mist-500"
          style={{ width: `${data.percentOfLimit}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-ink-500 mt-1.5">
        <span>0% of limit</span>
        <span className="font-medium text-ink-700">{data.percentOfLimit}%</span>
        <span>100%</span>
      </div>
    </div>
  )
}
