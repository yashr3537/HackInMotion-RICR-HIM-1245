import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Leaf } from 'lucide-react'
import { fetchUserAlerts } from '../services/supabase/supabaseService'
import { useAuth } from '../auth'
import LanguageSelector from './LanguageSelector'

export default function AppHeader() {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    let isMounted = true
    async function loadUnreadCount() {
      if (currentUser?.id) {
        const userAlerts = await fetchUserAlerts(currentUser.id)
        if (isMounted) {
          setUnread(userAlerts.filter((a) => !a.read).length)
        }
      } else {
        if (isMounted) setUnread(0)
      }
    }
    loadUnreadCount()
    return () => {
      isMounted = false
    }
  }, [currentUser?.id])

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-ink-100">
      <div className="flex items-center gap-4 px-5 sm:px-8 h-16">
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <span className="w-7 h-7 rounded-md bg-forest-800 flex items-center justify-center">
            <Leaf size={14} className="text-forest-300" />
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <LanguageSelector />

          <Link
            to="/alerts"
            className="relative p-2 rounded-xl text-ink-500 hover:text-ink-900 hover:bg-ink-100/60 transition-colors"
            title="Alerts"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {unread}
              </span>
            )}
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-ink-100">
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-forest-800 text-forest-100 text-xs font-semibold flex items-center justify-center">
                  {(currentUser.name || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-ink-900 leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-ink-400 capitalize">
                    {currentUser.profileType || 'general'}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-ink-400 hover:text-rose-600 ml-2"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-forest-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-forest-800 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
