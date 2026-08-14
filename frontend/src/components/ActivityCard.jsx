import { PersonStanding, Bike, Footprints, Trophy, HardHat } from 'lucide-react'

const ICONS = {
  running: PersonStanding,
  cycling: Bike,
  walking: Footprints,
  sports: Trophy,
  work: HardHat,
}

export default function ActivityCard({ activity, selected, onSelect }) {
  const Icon = ICONS[activity.icon] || Footprints
  return (
    <button
      onClick={() => onSelect(activity.key)}
      className={`flex flex-col items-center gap-2.5 rounded-xl border p-5 transition-all ${
        selected
          ? 'bg-forest-700 border-forest-700 text-white shadow-lift -translate-y-0.5'
          : 'bg-surface border-ink-100 text-ink-700 hover:border-forest-300 hover:-translate-y-0.5 shadow-soft'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center ${selected ? 'bg-white/15' : 'bg-forest-100'}`}
      >
        <Icon size={20} className={selected ? 'text-white' : 'text-forest-700'} />
      </div>
      <span className="font-medium text-sm text-center">{activity.label}</span>
    </button>
  )
}
