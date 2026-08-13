import { useLanguage } from '../i18n/index.jsx'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Compass, MapPin, History, Bell, User, Settings, Leaf, GitCompare, Footprints } from 'lucide-react'
import { alerts } from '../data/demoData'

const NAV = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/explore', key: 'features', icon: Compass },
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
  const unread = alerts.filter((a) => !a.read).length

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-forest-950 text-forest-100 px-4 py-6">
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <span className="w-8 h-8 rounded-lg bg-forest-500/20 flex items-center justify-center">
          <Leaf size={16} className="text-forest-300" />
        </span>
        <span className="font-display font-semibold text-lg text-white">AirGuard</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, key, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-forest-800 text-white' : 'text-forest-200/80 hover:bg-forest-900 hover:text-white'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Icon size={17} />
              {t(`nav.${key}`)}
            </span>
            {badge && unread > 0 && (
              <span className="bg-forest-400 text-forest-950 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-forest-900/80 px-2">
        <p className="text-xs text-forest-300/70 leading-relaxed">
          {t('sidebar.footerNotice')}
        </p>
      </div>
    </aside>
  )
}
