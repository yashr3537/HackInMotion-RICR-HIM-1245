import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/index.jsx'
import LanguageSelector from '../components/LanguageSelector.jsx'
import {
  Bell,
  Moon,
  Globe,
  ShieldCheck,
  Settings2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  Play,
} from 'lucide-react'

import {
  getVoiceLanguages,
  getStoredVoiceLanguage,
  setVoiceLanguage,
  isVoiceSupported,
  testVoiceAlert,
} from '../services/voiceAlert'

const INITIAL_ROWS = [
  {
    key: 'notifications',
    icon: Bell,
    title: 'Push Notifications',
    description: 'Receive alerts when air quality changes at saved locations.',
    enabled: true,
  },
  {
    key: 'darkMode',
    icon: Moon,
    title: 'Dark Mode',
    description: 'Use a darker color scheme across the AeroGuard application.',
    enabled: false,
  },
  {
    key: 'voiceAlerts',
    icon: Volume2,
    title: 'Voice Alerts',
    description: 'Speak important air-quality alerts aloud in your selected language.',
    enabled: true,
  },
]

const INFO_ROWS = [
  {
    key: 'units',
    icon: Globe,
    title: 'Units',
    description: 'Metric (µg/m³, mg/m³)',
  },
  {
    key: 'privacy',
    icon: ShieldCheck,
    title: 'Data & Privacy',
    description: 'Manage how your location data is used.',
  },
]

function applyDarkMode(enabled) {
  document.documentElement.classList.toggle('dark', enabled)

  document.documentElement.style.colorScheme = enabled ? 'dark' : 'light'

  window.localStorage.setItem('airguard-dark-mode', String(enabled))
}

function getStoredDarkMode() {
  const stored = window.localStorage.getItem('airguard-dark-mode')

  return stored === 'true'
}

function getStoredSettings() {
  const stored = window.localStorage.getItem('airguard-settings')

  if (!stored) return {}

  try {
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

function Toggle({ enabled, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      aria-label={`Toggle ${label}`}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-forest-500/10 ${
        enabled ? 'bg-forest-700' : 'bg-ink-200'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
          enabled ? 'left-6' : 'left-1'
        }`}
      />

      {enabled && (
        <span className="pointer-events-none absolute inset-0 animate-pulse rounded-full bg-forest-400/10" />
      )}
    </button>
  )
}

export default function Settings() {
  const { t, language } = useLanguage()
  const [rows, setRows] = useState(() => {
    const storedSettings = getStoredSettings()
    const darkMode = getStoredDarkMode()

    return INITIAL_ROWS.map((row) => ({
      ...row,
      enabled:
        row.key === 'darkMode'
          ? darkMode
          : typeof storedSettings[row.key] === 'boolean'
            ? storedSettings[row.key]
            : row.enabled,
    }))
  })

  const [voiceLanguage, setVoiceLanguageState] = useState(getStoredVoiceLanguage())

  const [saved, setSaved] = useState(false)
  const [voiceMessage, setVoiceMessage] = useState('')

  const [availableVoiceInfo, setAvailableVoiceInfo] = useState(null)
  const [loadingVoices, setLoadingVoices] = useState(false)

  const voiceSupported = isVoiceSupported()

  useEffect(() => {
    const settings = getStoredSettings()
    const darkMode = getStoredDarkMode()

    setRows((current) =>
      current.map((row) => ({
        ...row,
        enabled:
          row.key === 'darkMode'
            ? darkMode
            : typeof settings[row.key] === 'boolean'
              ? settings[row.key]
              : row.enabled,
      }))
    )

    applyDarkMode(darkMode)

    // load available voices for display
    let mounted = true
    async function load() {
      if (!voiceSupported) return
      setLoadingVoices(true)
      const list = await window.speechSynthesis.getVoices()
      if (mounted) setAvailableVoiceInfo(list)
      setLoadingVoices(false)
    }

    load()

    const onVoicesChanged = async () => {
      if (!voiceSupported) return
      const list = await window.speechSynthesis.getVoices()
      if (mounted) setAvailableVoiceInfo(list)
    }

    try {
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
    } catch (e) {
      // ignore
    }

    return () => {
      mounted = false
      try {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
      } catch (e) {}
    }
  }, [])

  function persistRows(nextRows) {
    const values = nextRows.reduce((acc, row) => {
      acc[row.key] = row.enabled
      return acc
    }, {})

    window.localStorage.setItem('airguard-settings', JSON.stringify(values))
  }

  function toggleSetting(key) {
    if (key === 'notifications' && typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'default') {
        window.Notification.requestPermission()
      }
    }

    setRows((current) => {
      const updatedRows = current.map((row) => {
        if (row.key !== key) return row

        const nextEnabled = !row.enabled

        if (key === 'darkMode') {
          applyDarkMode(nextEnabled)
        }

        return {
          ...row,
          enabled: nextEnabled,
        }
      })

      persistRows(updatedRows)
      return updatedRows
    })

    setSaved(false)
  }

  function handleLanguageChange(event) {
    const language = event.target.value

    setVoiceLanguageState(language)
    setVoiceLanguage(language)
    setSaved(false)

    // recalculate available voice info
    if (voiceSupported) {
      const voices = window.speechSynthesis.getVoices() || []
      const best =
        voices.find((v) => {
          const lang = (v.lang || '').toLowerCase()
          const base = language.split('-')[0].toLowerCase()
          return lang === language.toLowerCase() || lang === base || lang.startsWith(base)
        }) || null

      setAvailableVoiceInfo(best)
    }
  }

  async function handleTestVoice() {
    if (!voiceSupported) {
      setVoiceMessage('Voice playback is not supported by this browser.')
      return
    }

    setVoiceMessage('Testing voice...')

    try {
      const result = await testVoiceAlert(voiceLanguage)
      if (!result || result.success === false) {
        setVoiceMessage(
          'Voice playback was blocked or unavailable. Please interact with the page and try Test Voice again.'
        )
      } else {
        setVoiceMessage('Test voice played successfully.')
      }
    } catch (e) {
      setVoiceMessage(
        'Voice playback failed. Please try Test Voice after interacting with the page.'
      )
    }

    window.setTimeout(() => {
      setVoiceMessage('')
    }, 2400)
  }

  function saveSettings() {
    persistRows(rows)
    setVoiceLanguage(voiceLanguage)

    const darkModeEnabled = rows.find((row) => row.key === 'darkMode')?.enabled || false

    applyDarkMode(darkModeEnabled)

    setSaved(true)

    window.setTimeout(() => {
      setSaved(false)
    }, 2200)
  }

  const darkModeEnabled = rows.find((row) => row.key === 'darkMode')?.enabled || false

  const voiceAlertsEnabled = rows.find((row) => row.key === 'voiceAlerts')?.enabled || false

  return (
    <div className="page-enter flex max-w-3xl flex-col gap-7 pb-8 sm:gap-9">
      {/* HEADER */}
      <section className="fade-down">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
          <Settings2 size={12} />
          {t('settings.applicationPreferences')}
        </div>

        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
          {t('settings.title')}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
          Customize notifications, appearance, voice alerts and privacy preferences for your
          AeroGuard experience.
        </p>
      </section>

      {/* LANGUAGE */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-canvas p-4 sm:p-5">
          <div className="relative flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">{t('settings.language')}</p>

              <p className="mt-1 text-xs text-ink-500">
                {t('settings.languageDescription') ||
                  'Choose the language used across the AirGuard interface.'}
              </p>
            </div>

            <div>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </section>

      {/* APPEARANCE */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-forest-400/10 blur-3xl float-soft" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 shadow-sm">
              {darkModeEnabled ? <Moon size={17} /> : <Sun size={17} />}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">Appearance</p>

              <p className="mt-1 text-xs text-ink-500">
                AeroGuard is currently using{' '}
                <span className="font-semibold">
                  {darkModeEnabled ? 'Dark Mode' : 'Light Mode'}
                </span>
                .
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-forest-200 bg-white px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-forest-800 sm:flex">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-600" />
              Active
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="fade-up">
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-forest-700">
            Experience
          </p>

          <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">App preferences</h2>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-ink-100 bg-surface shadow-soft">
          <div className="stagger-children divide-y divide-ink-100">
            {rows.map((row) => {
              const Icon = row.icon

              return (
                <div
                  key={row.key}
                  className="group flex items-center gap-4 p-5 transition-all duration-300 hover:bg-ink-50/50 sm:p-6"
                >
                  <div className="card-hover flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-forest-100 bg-forest-50 text-forest-700">
                    <Icon
                      size={18}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">{row.title}</p>

                      {row.enabled && (
                        <span className="hidden rounded-full border border-forest-200 bg-forest-50 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-forest-800 sm:inline-flex">
                          Enabled
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-ink-500">{row.description}</p>
                  </div>

                  <Toggle
                    enabled={row.enabled}
                    onToggle={() => toggleSetting(row.key)}
                    label={row.title}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* VOICE ALERTS */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-[24px] border border-forest-100 bg-surface p-6 shadow-soft sm:p-7">
          <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-forest-400/7 blur-3xl float-soft" />

          <div className="relative z-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                  {voiceAlertsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </div>

                <div>
                  <h2 className="font-display text-lg font-semibold text-ink-900">Voice Alerts</h2>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-ink-500">
                    Important air-quality alerts can be spoken aloud in your selected language.
                  </p>
                </div>

                <Toggle
                  enabled={voiceAlertsEnabled}
                  onToggle={() => toggleSetting('voiceAlerts')}
                  label="Voice Alerts"
                />
              </div>

              <div
                className={`rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                  voiceSupported
                    ? 'border-forest-200 bg-forest-50 text-forest-800'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                {voiceSupported ? 'Browser voice available' : 'Voice not supported'}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label
                  htmlFor="voice-language"
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400"
                >
                  Voice Language
                </label>

                <div className="relative">
                  <Globe
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                  />

                  <select
                    id="voice-language"
                    value={voiceLanguage}
                    onChange={handleLanguageChange}
                    disabled={!voiceAlertsEnabled}
                    className="w-full appearance-none rounded-xl border border-ink-200 bg-ink-50/70 px-3.5 py-3 pl-10 text-sm font-medium text-ink-900 outline-none transition-all duration-300 focus:border-forest-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {getVoiceLanguages().map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.label}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 text-xs text-ink-500">
                    <div>
                      <span className="font-semibold">Selected language:</span>{' '}
                      {getVoiceLanguages().find((l) => l.code === voiceLanguage)?.label}
                    </div>
                    <div>
                      <span className="font-semibold">Browser voice:</span>{' '}
                      {loadingVoices && 'Checking available voices...'}
                      {!loadingVoices && !voiceSupported && 'Not supported by browser'}
                      {!loadingVoices &&
                        voiceSupported &&
                        (availableVoiceInfo
                          ? `${availableVoiceInfo.name} (${availableVoiceInfo.lang})`
                          : 'Voice for this language is not available on this device/browser.')}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestVoice}
                disabled={!voiceSupported || !voiceAlertsEnabled}
                className="btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play size={14} />
                Test Voice
              </button>
            </div>

            {voiceMessage && (
              <div className="notification-enter mt-4 inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-3.5 py-2.5 text-xs font-medium text-forest-800">
                <Volume2 size={13} />
                {voiceMessage}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INFORMATION */}
      <section className="fade-up">
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-forest-700">
            Information & privacy
          </p>

          <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">Data preferences</h2>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-ink-100 bg-surface shadow-soft">
          <div className="stagger-children divide-y divide-ink-100">
            {INFO_ROWS.map((row) => {
              const Icon = row.icon

              return (
                <button
                  key={row.key}
                  type="button"
                  className="group flex w-full items-center gap-4 p-5 text-left transition-all duration-300 hover:bg-ink-50/50 sm:p-6"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink-100 bg-ink-50 text-ink-600 transition-all duration-300 group-hover:scale-105 group-hover:border-forest-100 group-hover:bg-forest-50 group-hover:text-forest-700">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900">{row.title}</p>

                    <p className="mt-1 text-xs leading-5 text-ink-500">{row.description}</p>
                  </div>

                  <ChevronRight
                    size={17}
                    className="shrink-0 text-ink-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-forest-700"
                  />
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* SAVE */}
      <section className="fade-up">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={saveSettings}
            className="btn-premium inline-flex w-fit items-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-forest-800"
          >
            <CheckCircle2 size={15} />
            Save Settings
          </button>

          {saved && (
            <div className="notification-enter inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-4 py-2.5 text-sm font-medium text-forest-800">
              <CheckCircle2 size={15} />
              Settings saved successfully.
            </div>
          )}
        </div>
      </section>

      <p className="fade-up text-[10px] leading-5 text-ink-400">
        Voice availability depends on the voices installed or provided by the user's browser/device.
        The application falls back to the closest available voice for the selected language.
      </p>
    </div>
  )
}
