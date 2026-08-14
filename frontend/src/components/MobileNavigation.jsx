import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Compass, MapPin, Bell, User, AlertOctagon } from 'lucide-react'
import { alerts } from '../data/demoData'

const NAV = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/report', label: 'Report', icon: AlertOctagon },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/locations', label: 'Places', icon: MapPin },
  { to: '/alerts', label: 'Alerts', icon: Bell, badge: true },
]

export default function MobileNavigation() {
  const unread = alerts.filter((a) => !a.read).length

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-ink-100 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between">
        {NAV.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-forest-700' : 'text-ink-500'
              }`
            }
          >
            <Icon size={20} />
            {label}
            {badge && unread > 0 && (
              <span className="absolute top-1.5 right-[26%] w-2 h-2 rounded-full bg-forest-600" />
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
