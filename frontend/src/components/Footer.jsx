import { Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-forest-200/80 mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-md bg-forest-500/20 flex items-center justify-center">
              <Leaf size={14} className="text-forest-300" />
            </span>
            <span className="font-display font-semibold text-white">AirGuard</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">See the air. Understand the risk. Take action.</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-400 mb-3">Product</p>
          <ul className="space-y-2 text-sm">
            <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-400 mb-3">Company</p>
          <ul className="space-y-2 text-sm">
            <li><a href="/#about" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-forest-900 px-5 sm:px-8 py-5 text-xs text-forest-400">
        © {new Date().getFullYear()} AirGuard. Demo build — data shown is illustrative.
      </div>
    </footer>
  )
}
