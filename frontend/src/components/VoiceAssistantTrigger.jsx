import { useState } from 'react'
import { Bot, Mic, Sparkles } from 'lucide-react'
import VoiceAssistantModal from './VoiceAssistantModal'

export default function VoiceAssistantTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-5 sm:right-8 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full bg-forest-800 px-4 py-3 text-white shadow-xl hover:bg-forest-900 focus:outline-none focus:ring-4 focus:ring-forest-500/30 transition-all duration-300 hover:scale-105"
          aria-label="Open Voice Assistant"
        >
          <span className="absolute -inset-1 rounded-full bg-forest-400/20 blur-md transition-opacity duration-300 group-hover:opacity-100" />

          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-forest-200">
            <Bot size={18} className="transition-transform group-hover:rotate-12" />
          </span>

          <span className="relative font-semibold text-xs sm:text-sm tracking-wide hidden sm:inline-block">
            Voice Assistant
          </span>

          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-forest-300" />
          </span>
        </button>
      </div>

      {/* Unified Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
