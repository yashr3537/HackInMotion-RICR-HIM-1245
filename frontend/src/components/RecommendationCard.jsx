import { Link } from 'react-router-dom'
import { Sparkles, User, Footprints, ArrowRight } from 'lucide-react'

export default function RecommendationCard({ recommendation }) {
  return (
    <div className="bg-gradient-to-br from-forest-900 to-forest-700 rounded-xl2 shadow-lift p-6 sm:p-7 text-white relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-forest-500/20 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-forest-200 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles size={14} />
          Your Environmental Recommendation
        </div>
        <p className="text-lg sm:text-xl font-display font-semibold leading-snug mb-1.5">{recommendation.headline}</p>
        <p className="text-forest-100/90 text-sm leading-relaxed max-w-md">{recommendation.detail}</p>

        <div className="flex flex-wrap gap-3 mt-6">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm">
            <User size={15} className="text-forest-200" />
            <span>{recommendation.profile}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm">
            <Footprints size={15} className="text-forest-200" />
            <span>{recommendation.activity}</span>
          </div>
          <div className="flex items-center gap-2 bg-white text-forest-800 rounded-lg px-3 py-2 text-sm font-semibold">
            {recommendation.verdict}
          </div>
        </div>

        <Link
          to="/activity"
          className="inline-flex items-center gap-2 mt-6 bg-white text-forest-800 font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-forest-50 transition-colors"
        >
          Check Activity Risk
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
