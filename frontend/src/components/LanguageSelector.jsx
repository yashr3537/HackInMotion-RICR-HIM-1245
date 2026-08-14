import React from 'react'
import { useLanguage } from '../i18n/index.jsx'

const OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'ur', label: 'اردو' },
]

export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className={`inline-flex items-center gap-2 ${compact ? 'text-sm' : ''}`}>
      <label htmlFor="ag-language" className="sr-only">
        {t('common.language')}
      </label>
      <select
        id="ag-language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label={t('common.language')}
        className="rounded-md border border-ink-200 bg-surface px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
      >
        {OPTIONS.map((o) => (
          <option key={o.code} value={o.code}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
