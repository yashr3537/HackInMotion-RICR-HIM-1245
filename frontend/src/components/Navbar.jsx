import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Leaf } from 'lucide-react'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/#features', label: 'Features' },
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/#about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-canvas/85 backdrop-blur-md border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-forest-800 flex items-center justify-center">
            <Leaf size={16} className="text-forest-300" />
          </span>
          <span className="font-display font-semibold text-lg text-ink-900">AirGuard</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <a key={l.label} href={l.to} className="text-sm font-medium text-ink-700 hover:text-forest-700 transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-ink-700 hover:text-forest-700 px-3 py-2 transition-colors">
            Login
          </Link>
          <Link
            to="/dashboard"
            className="bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Check Air Quality
          </Link>
        </div>

        <button className="md:hidden p-2 text-ink-700" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-100 bg-canvas px-5 py-4 flex flex-col gap-1">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.to}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-ink-700 py-2.5"
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 mt-2">
            <Link to="/login" className="flex-1 text-center text-sm font-medium border border-ink-200 rounded-lg py-2.5">
              Login
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 text-center bg-forest-700 text-white text-sm font-semibold rounded-lg py-2.5"
            >
              Check Air Quality
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
