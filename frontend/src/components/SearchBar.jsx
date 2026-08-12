import { Search } from 'lucide-react'

export default function SearchBar({ placeholder = 'Search location…', value, onChange, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-ink-100/70 border border-transparent focus:border-forest-400 focus:bg-white rounded-lg pl-10 pr-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 outline-none transition-colors"
      />
    </div>
  )
}
