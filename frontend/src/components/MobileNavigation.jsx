import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Compass, MapPin, Bell, AlertOctagon } from 'lucide-react'
import { fetchUserAlerts } from '../services/supabase/supabaseService'
import { useAuth } from '../auth'

const NAV = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/report', label: 'Report', icon: AlertOctagon },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/locations', label: 'Places', icon: MapPin },
  { to: '/alerts', label: 'Alerts', icon: Bell, badge: true },
]

export default function MobileNavigation() {
  const { currentUser } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    let isMounted = true
    async function loadAlerts() {
      if (currentUser?.id) {
        const userAlerts = await fetchUserAlerts(currentUser.id)
        if (isMounted) setUnread(userAlerts.filter((a) => !a.read).length)
      } else {
        if (isMounted) setUnread(0)
      }
    }
    loadAlerts()
    return () => {
      isMounted = false
    }
  }, [currentUser?.id])

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
            <div className="relative">
              <Icon size={20} />
              {badge && unread > 0 && (
                <span className="absolute -top-1 -right-2.5 min-w-[14px] h-[14px] px-1 rounded-full bg-rose-600 text-white text-[8px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </div>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
