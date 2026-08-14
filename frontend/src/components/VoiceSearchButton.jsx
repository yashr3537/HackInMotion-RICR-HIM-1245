import { Mic } from 'lucide-react'

export default function VoiceSearchButton({ onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Ask AirGuard"
      aria-label="Ask AirGuard"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-forest-200 bg-forest-50 text-forest-700 transition-all duration-200 hover:border-forest-300 hover:bg-forest-100 hover:text-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Mic size={15} />
    </button>
  )
}
