import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'
import AQICard from '../components/AQICard'
import PollutantCard from '../components/PollutantCard'
import RecommendationCard from '../components/RecommendationCard'
import DominantPollutantCard from '../components/DominantPollutantCard'
import TrendChart from '../components/TrendChart'
import LocationCard from '../components/LocationCard'
import { currentLocation, pollutants, recommendation, dominantPollutant, savedLocations } from '../data/demoData'
import { useAuth } from '../auth'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink-900">
          {greeting}, {currentUser.name}
        </h1>
        <div className="flex items-center gap-1.5 text-ink-500 text-sm mt-1.5">
          <MapPin size={14} className="text-forest-600" />
          {currentLocation.name}, {currentLocation.region}
        </div>
      </div>

      <AQICard location={currentLocation} />

      <div>
        <h2 className="font-display font-semibold text-lg text-ink-900 mb-4">Pollutant Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {pollutants.map((p) => (
            <PollutantCard key={p.key} pollutant={p} />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5 sm:gap-6">
        <div className="lg:col-span-3">
          <RecommendationCard recommendation={recommendation} />
        </div>
        <div className="lg:col-span-2">
          <DominantPollutantCard data={dominantPollutant} />
        </div>
      </div>

      <TrendChart />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-ink-900">My Locations</h2>
          <Link to="/locations" className="flex items-center gap-1 text-sm font-medium text-forest-700 hover:text-forest-800">
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedLocations.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </div>
      </div>
    </div>
  )
}
