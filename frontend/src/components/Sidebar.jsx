import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/index.jsx'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Compass, MapPin, History, Bell, User, Settings, Leaf, GitCompare, Footprints, AlertOctagon, FileText } from 'lucide-react'
import { fetchUserAlerts } from '../services/supabase/supabaseService'
import { useAuth } from '../auth'
import LanguageSelector from './LanguageSelector.jsx'

const NAV = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/report', key: 'reportIssue', icon: AlertOctagon },
  { to: '/my-reports', key: 'myReports', icon: FileText },
  { to: '/explore', key: 'explore', icon: Compass },
  { to: '/locations', key: 'locations', icon: MapPin },
  { to: '/compare', key: 'compare', icon: GitCompare },
  { to: '/activity', key: 'activity', icon: Footprints },
  { to: '/history', key: 'history', icon: History },
  { to: '/alerts', key: 'alerts', icon: Bell, badge: true },
  { to: '/profile', key: 'profile', icon: User },
  { to: '/settings', key: 'settings', icon: Settings },
]

export default function Sidebar() {
  const { t } = useLanguage()
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
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-surface border-r border-ink-100 min-h-screen">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-ink-100">
        <span className="w-8 h-8 rounded-lg bg-forest-800 flex items-center justify-center shadow-soft">
          <Leaf size={16} className="text-forest-300" />
        </span>
        <div>
          <span className="font-display font-bold text-ink-900 tracking-tight text-lg leading-tight block">
            AirGuard
          </span>
          <span className="text-[10px] text-forest-700 uppercase tracking-widest font-semibold block">
            Platform
          </span>
        </div>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV.map(({ to, key, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-forest-50 text-forest-800 font-semibold'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Icon size={18} />
              <span>{t(`nav.${key}`)}</span>
            </div>
            {badge && unread > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-ink-100 space-y-3">
        <LanguageSelector />
        <p className="text-[10px] text-ink-400 text-center">
          AirGuard Risk Platform v2.0
        </p>
      </div>
    </aside>
  )
}
