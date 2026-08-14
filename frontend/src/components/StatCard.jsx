export default function StatCard({ label, value, unit, accent = false }) {
  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 ${accent ? 'bg-forest-50 border-forest-200' : 'bg-surface border-ink-100'}`}
    >
      <p className="text-xs font-medium text-ink-500 mb-1.5">{label}</p>
      <p className={`font-mono font-bold text-2xl ${accent ? 'text-forest-800' : 'text-ink-900'}`}>
        {value}
        {unit && <span className="text-sm font-normal text-ink-500 ml-1">{unit}</span>}
      </p>
    </div>
  )
}
