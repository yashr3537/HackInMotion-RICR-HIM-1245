import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { getAqiBand } from '../data/aqiUtils'

export default function RiskBadge({ aqi, size = 'md' }) {
  const band = getAqiBand(aqi)

  const [visible, setVisible] = useState(false)

  const sizes = {
    sm: {
      wrapper: 'text-[11px] px-2 py-0.5 gap-1',
      dot: 'w-1.5 h-1.5',
      icon: 10,
    },
    md: {
      wrapper: 'text-xs px-2.5 py-1 gap-1.5',
      dot: 'w-1.5 h-1.5',
      icon: 11,
    },
    lg: {
      wrapper: 'text-sm px-3 py-1.5 gap-2',
      dot: 'w-2 h-2',
      icon: 13,
    },
  }

  const currentSize = sizes[size] || sizes.md

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true)
    }, 80)

    return () => window.clearTimeout(timer)
  }, [aqi])

  return (
    <span
      className={`
        inline-flex items-center rounded-full
        font-semibold tracking-wide uppercase
        border
        transition-all duration-500
        ${currentSize.wrapper}
        ${visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-95 opacity-0'}
        hover:scale-[1.04]
      `}
      style={{
        backgroundColor: band.bg,
        color: band.color,
        borderColor: `${band.color}25`,
        boxShadow: `0 0 18px ${band.color}18`,
      }}
    >
      {/* Animated status dot */}
      <span className="relative flex items-center justify-center">
        <span
          className={`${currentSize.dot} rounded-full`}
          style={{
            backgroundColor: band.color,
            boxShadow: `0 0 8px ${band.color}70`,
          }}
        />

        <span
          className={`absolute ${currentSize.dot} rounded-full animate-ping`}
          style={{
            backgroundColor: band.color,
            opacity: 0.35,
          }}
        />
      </span>

      {/* Optional shield icon for larger badges */}
      {size === 'lg' && (
        <ShieldAlert size={currentSize.icon} strokeWidth={2.2} className="shrink-0" />
      )}

      <span>{band.label}</span>
    </span>
  )
}
