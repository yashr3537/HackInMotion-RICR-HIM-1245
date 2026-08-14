import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import translations from './language.js'
import { getStoredVoiceLanguage, setVoiceLanguage } from '../services/voiceAlert'

const STORAGE_KEY = 'airguard-language'
const DEFAULT = 'en'

const I18nContext = createContext({})

function getInitialLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && translations[stored]) return stored
  } catch (e) {}
  return DEFAULT
}

function languageToVoiceCode(lang) {
  // Map UI language codes to voice codes used by voiceAlert (regional codes)
  const map = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
    ur: 'ur-IN',
  }
  return map[lang] || 'en-IN'
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => getInitialLanguage())

  useEffect(() => {
    // persist and set document attributes
    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch (e) {}

    document.documentElement.lang = language
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr'

    // If voice language is default, suggest matching voice language
    try {
      const storedVoice = getStoredVoiceLanguage()
      const defaultVoice = 'en-IN'
      const desired = languageToVoiceCode(language)
      if (!storedVoice || storedVoice === defaultVoice) {
        setVoiceLanguage(desired)
      }
    } catch (e) {}
  }, [language])

  const t = useMemo(() => {
    return (key, vars = {}) => {
      if (!key) return ''
      const parts = key.split('.')

      // Try selected language
      let node = translations[language]
      for (let p of parts) {
        if (node && Object.prototype.hasOwnProperty.call(node, p)) {
          node = node[p]
        } else {
          node = null
          break
        }
      }

      // If found, interpolate and return
      if (typeof node === 'string') {
        return node.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`))
      }

      // Fallback to English
      let fallback = translations['en']
      for (let p of parts) {
        if (fallback && Object.prototype.hasOwnProperty.call(fallback, p)) {
          fallback = fallback[p]
        } else {
          fallback = null
          break
        }
      }

      if (typeof fallback === 'string') {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`i18n: missing key "${key}" for language "${language}", falling back to English.`)
        }
        return fallback.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`))
      }

      // Final safe fallback: if a defaultValue was provided use it
      if (vars && vars.defaultValue) return vars.defaultValue

      // Final safe fallback: human-readable key
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`i18n: missing key "${key}" for language "${language}" and English fallback.`)
      }
      const safe = parts.join(' ').replace(/\b(\w)/g, (m) => m.toUpperCase())
      return safe
    }
  }, [language])

  return (
    <I18nContext.Provider value={{ language, setLanguage: setLanguageState, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useLanguage() {
  return useContext(I18nContext)
}

export default I18nContext
