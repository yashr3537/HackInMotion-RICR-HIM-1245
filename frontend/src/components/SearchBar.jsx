import { useEffect, useRef, useState } from 'react'
import {
  Search,
  MapPin,
  X,
  Navigation,
  Loader2,
} from 'lucide-react'

import VoiceAssistant from './VoiceAssistant'
import VoiceSearchButton from './VoiceSearchButton'

export default function SearchBar({
  placeholder = 'Search location…',
  value,
  onChange,
  className = '',
}) {
  const [focused, setFocused] = useState(false)
  const [locating, setLocating] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const inputRef = useRef(null)

  const handleClear = () => {
    onChange?.('')
    inputRef.current?.focus()
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation || locating) return

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        /*
          Keep the component reusable.
          Parent can later use these coordinates by extending the
          callback/API layer without changing the visual component.
        */
        onChange?.(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)

        setLocating(false)
      },
      () => {
        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      },
    )
  }

  useEffect(() => {
    const handleKeyboard = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }

      if (event.key === 'Escape' && focused) {
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyboard)

    return () => {
      window.removeEventListener('keydown', handleKeyboard)
    }
  }, [focused])

  return (
    <div
      className={`search-premium group relative ${className}`}
    >
      {/* Ambient focus glow */}
      <div
        className={`pointer-events-none absolute -inset-1 rounded-2xl bg-forest-400/10 blur-xl transition-all duration-500 ${
          focused ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      />

      {/* Main search field */}
      <div
        className={`relative flex items-center overflow-hidden rounded-xl border bg-white transition-all duration-300 ${
          focused
            ? 'border-forest-400 shadow-[0_0_0_4px_rgba(34,168,95,0.07),0_12px_30px_rgba(15,23,42,0.08)]'
            : 'border-ink-200 shadow-sm'
        }`}
      >
        {/* Search icon */}
        <div
          className={`absolute left-3.5 flex items-center justify-center transition-all duration-300 ${
            focused
              ? 'scale-110 text-forest-700'
              : 'text-ink-300'
          }`}
        >
          <Search size={16} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setFocused(false), 120)
          }}
          placeholder={placeholder}
          aria-label="Search location"
          className="min-w-0 flex-1 bg-transparent py-3 pl-10 pr-24 text-sm text-ink-900 outline-none placeholder:text-ink-400"
        />

        {/* Right actions */}
        <div className="absolute right-2 flex items-center gap-1">
          <VoiceSearchButton onClick={() => setVoiceOpen(true)} />

          {/* Clear */}
          {value && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClear}
              className="icon-hover flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}

          {/* Current location */}
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleUseLocation}
            disabled={locating}
            className="btn-premium flex h-8 items-center gap-1.5 rounded-lg border border-forest-100 bg-forest-50 px-2.5 text-[11px] font-semibold text-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Use current location"
          >
            {locating ? (
              <Loader2
                size={13}
                className="animate-spin"
              />
            ) : (
              <Navigation size={13} />
            )}

            <span className="hidden sm:inline">
              {locating ? 'Locating' : 'Use location'}
            </span>
          </button>
        </div>
      </div>

      <VoiceAssistant
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onTranscript={(transcript) => {
          onChange?.(transcript)
          setVoiceOpen(false)
        }}
      />

      {/* Premium helper footer */}
      <div className="mt-2 flex items-center justify-between px-1">
        <div
          className={`flex items-center gap-1.5 text-[10px] transition-colors duration-300 ${
            focused ? 'text-forest-700' : 'text-ink-400'
          }`}
        >
          <MapPin size={11} />
          Search by city, area or saved place
        </div>

        <div className="hidden items-center gap-1 text-[9px] text-ink-400 sm:flex">
          <kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-mono">
            Ctrl
          </kbd>

          <span>+</span>

          <kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-mono">
            K
          </kbd>
        </div>
      </div>
    </div>
  )
}