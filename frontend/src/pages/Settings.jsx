import { useEffect, useState } from 'react'
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
} from 'lucide-react'

const INITIAL_ROWS = [
  {
    key: 'notifications',
    icon: Bell,
    title: 'Push Notifications',
    description:
      'Receive alerts when air quality changes at saved locations.',
    enabled: true,
  },
  {
    key: 'darkMode',
    icon: Moon,
    title: 'Dark Mode',
    description:
      'Use a darker color scheme across the AeroGuard application.',
    enabled: false,
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

  if (enabled) {
    document.documentElement.style.colorScheme = 'dark'
  } else {
    document.documentElement.style.colorScheme = 'light'
  }

  window.localStorage.setItem(
    'airguard-dark-mode',
    String(enabled),
  )
}

function getStoredDarkMode() {
  const stored = window.localStorage.getItem(
    'airguard-dark-mode',
  )

  if (stored === null) {
    return false
  }

  return stored === 'true'
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
        <span className="pointer-events-none absolute inset-0 rounded-full bg-forest-400/10 animate-pulse" />
      )}
    </button>
  )
}

export default function Settings() {
  const [rows, setRows] = useState(() => {
    const darkMode = getStoredDarkMode()

    return INITIAL_ROWS.map((row) =>
      row.key === 'darkMode'
        ? {
            ...row,
            enabled: darkMode,
          }
        : row,
    )
  })

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(
      'airguard-settings',
    )

    if (!stored) {
      applyDarkMode(getStoredDarkMode())
      return
    }

    try {
      const parsed = JSON.parse(stored)

      setRows((current) =>
        current.map((row) => ({
          ...row,
          enabled:
            typeof parsed[row.key] === 'boolean'
              ? parsed[row.key]
              : row.enabled,
        })),
      )

      if (typeof parsed.darkMode === 'boolean') {
        applyDarkMode(parsed.darkMode)
      }
    } catch {
      applyDarkMode(getStoredDarkMode())
    }
  }, [])

  function toggleSetting(key) {
  setRows((current) => {
    const updatedRows = current.map((row) => {
      if (row.key !== key) {
        return row
      }

      const nextEnabled = !row.enabled

      if (key === 'darkMode') {
        applyDarkMode(nextEnabled)
      }

      return {
        ...row,
        enabled: nextEnabled,
      }
    })

    // Immediately persist the latest settings.
    const settingsToSave = updatedRows.reduce((acc, row) => {
      acc[row.key] = row.enabled
      return acc
    }, {})

    window.localStorage.setItem(
      'airguard-settings',
      JSON.stringify(settingsToSave),
    )

    return updatedRows
  })

  setSaved(false)
}

  function saveSettings() {
  const values = rows.reduce((acc, row) => {
    acc[row.key] = row.enabled
    return acc
  }, {})

  window.localStorage.setItem(
    'airguard-settings',
    JSON.stringify(values),
  )

  applyDarkMode(Boolean(values.darkMode))

  setSaved(true)

  window.setTimeout(() => {
    setSaved(false)
  }, 2200)
}

  const darkModeEnabled = rows.find(
    (row) => row.key === 'darkMode',
  )?.enabled

  return (
    <div className="page-enter flex max-w-3xl flex-col gap-7 pb-8 sm:gap-9">
      {/* HEADER */}
      <section className="fade-down">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
          <Settings2 size={12} />
          Application preferences
        </div>

        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
          Customize notifications, appearance and privacy preferences for
          your AeroGuard experience.
        </p>
      </section>

      {/* THEME STATUS */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-forest-400/10 blur-3xl float-soft" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 shadow-sm">
              {darkModeEnabled ? (
                <Moon size={17} />
              ) : (
                <Sun size={17} />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">
                Appearance
              </p>

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

          <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">
            App preferences
          </h2>
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
                      <p className="text-sm font-semibold text-ink-900">
                        {row.title}
                      </p>

                      {row.enabled && (
                        <span className="hidden rounded-full border border-forest-200 bg-forest-50 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-forest-800 sm:inline-flex">
                          Enabled
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-ink-500">
                      {row.description}
                    </p>
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

      {/* INFORMATION */}
      <section className="fade-up">
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-forest-700">
            Information & privacy
          </p>

          <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">
            Data preferences
          </h2>
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
                    <p className="text-sm font-semibold text-ink-900">
                      {row.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-ink-500">
                      {row.description}
                    </p>
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
        Dark Mode is saved locally on this device and remains active after
        refreshing the page.
      </p>
    </div>
  )
}