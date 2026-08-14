import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Leaf, Bot } from 'lucide-react'
import { alerts } from '../data/demoData'
import { useAuth } from '../auth'
import LanguageSelector from './LanguageSelector'
import VoiceAssistantModal from './VoiceAssistantModal'

export default function AppHeader() {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const unread = alerts.filter((a) => !a.read).length

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-ink-100">
        <div className="flex items-center gap-4 px-5 sm:px-8 h-16">
          <div className="lg:hidden flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 rounded-md bg-forest-800 flex items-center justify-center">
              <Leaf size={14} className="text-forest-300" />
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => setIsAssistantOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-50 border border-forest-200 text-forest-800 hover:bg-forest-100 text-xs font-semibold transition-colors"
              aria-label="Open Voice Assistant"
            >
              <Bot size={16} className="text-forest-700" />
              <span className="hidden sm:inline">Voice Assistant</span>
            </button>

            <LanguageSelector compact />

            <Link
              to="/alerts"
              className="relative w-9 h-9 rounded-lg bg-surface border border-ink-100 flex items-center justify-center text-ink-600 hover:text-forest-700 hover:border-forest-300 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unread > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-forest-600 ring-2 ring-canvas" />}
            </Link>
            <Link to="/profile" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-forest-700 text-white flex items-center justify-center text-sm font-semibold">
                {currentUser.name.charAt(0)}
              </div>
              <span className="hidden sm:block text-sm font-medium text-ink-900">{currentUser.name}</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden sm:inline-flex text-xs font-semibold text-ink-600 hover:text-forest-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <VoiceAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </>
  )
}

