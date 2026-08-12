import { Link } from 'react-router-dom'
import { Compass as CompassIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-5 text-center">
      <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center mb-5">
        <CompassIcon size={24} className="text-forest-700" />
      </div>
      <h1 className="font-display font-semibold text-2xl text-ink-900 mb-2">Page not found</h1>
      <p className="text-ink-500 text-sm max-w-sm mb-6">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm px-5 py-3 rounded-lg transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
