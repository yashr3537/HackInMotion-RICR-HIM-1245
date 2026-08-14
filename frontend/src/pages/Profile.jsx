import { useEffect, useState } from 'react'
import {
  Baby,
  PersonStanding,
  Wind as LungIcon,
  HardHat,
  User as UserIcon,
  ShieldCheck,
  BellRing,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../auth'

const PROFILES = [
  {
    key: 'general',
    label: 'General',
    icon: UserIcon,
    description: 'Standard sensitivity to air quality changes.',
  },
  {
    key: 'child',
    label: 'Child',
    icon: Baby,
    description: 'Higher sensitivity due to developing lungs.',
  },
  {
    key: 'elderly',
    label: 'Elderly',
    icon: PersonStanding,
    description: 'Increased risk from prolonged exposure.',
  },
  {
    key: 'respiratory',
    label: 'Respiratory Sensitive',
    icon: LungIcon,
    description: 'Asthma or other respiratory conditions.',
  },
  {
    key: 'outdoor-worker',
    label: 'Outdoor Worker',
    icon: HardHat,
    description: 'Extended daily outdoor exposure.',
  },
]

export default function Profile() {
  const { currentUser, updateCurrentUser } = useAuth()

  const [profileType, setProfileType] = useState(currentUser?.profileType || 'general')

  const [threshold, setThreshold] = useState(currentUser?.alertThreshold || 100)

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProfileType(currentUser?.profileType || 'general')

    setThreshold(currentUser?.alertThreshold || 100)
  }, [currentUser])

  function handleSave() {
    updateCurrentUser({
      profileType,
      alertThreshold: threshold,
    })

    setSaved(true)

    window.setTimeout(() => {
      setSaved(false)
    }, 2200)
  }

  const activeProfile = PROFILES.find((profile) => profile.key === profileType) || PROFILES[0]

  const ActiveIcon = activeProfile.icon

  return (
    <div className="page-enter flex max-w-4xl flex-col gap-7 pb-8 sm:gap-9">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <section className="fade-down">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800">
          <Sparkles size={12} />
          Personal environmental profile
        </div>

        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
          Your Profile
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
          Manage your environmental sensitivity and notification preferences so AeroGuard can make
          risk information more relevant to you.
        </p>
      </section>

      {/* =====================================================
          USER IDENTITY
      ====================================================== */}
      <section className="scale-in">
        <div className="card-hover card-glow relative overflow-hidden rounded-[26px] border border-ink-100 bg-surface p-6 shadow-soft sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-forest-400/6 blur-3xl float-soft" />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-forest-700 font-display text-2xl font-semibold text-white shadow-sm transition-transform duration-300 hover:scale-105 hover:-rotate-2">
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div>
                <p className="font-display text-xl font-semibold text-ink-900">
                  {currentUser?.fullName || currentUser?.name || 'User'}
                </p>

                <p className="mt-1 text-sm text-ink-500">
                  {currentUser?.email || 'No email available'}
                </p>

                <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-forest-700">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-600" />
                  Account active
                </div>
              </div>
            </div>

            {/* Current profile summary */}
            <div className="flex items-center gap-3 rounded-xl border border-forest-100 bg-forest-50 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest-700 shadow-sm">
                <ActiveIcon size={17} />
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-forest-700/70">
                  Current profile
                </p>

                <p className="mt-0.5 text-sm font-semibold text-forest-900">
                  {activeProfile.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ENVIRONMENTAL PROFILE
      ====================================================== */}
      <section className="fade-up">
        <div className="rounded-[26px] border border-ink-100 bg-surface p-6 shadow-soft sm:p-7">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                <ShieldCheck size={17} />
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold text-ink-900">
                  Environmental Profile
                </h2>

                <p className="mt-0.5 text-xs text-ink-500">
                  Used to personalize risk levels and activity recommendations.
                </p>
              </div>
            </div>
          </div>

          <div className="stagger-children flex flex-col gap-3">
            {PROFILES.map((profile) => {
              const Icon = profile.icon
              const active = profileType === profile.key

              return (
                <label
                  key={profile.key}
                  className={`card-hover group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                    active
                      ? 'border-forest-300 bg-forest-50 shadow-sm'
                      : 'border-ink-100 bg-white hover:border-ink-200'
                  }`}
                >
                  {active && (
                    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-forest-400/10 blur-2xl" />
                  )}

                  <input
                    type="radio"
                    name="profileType"
                    checked={active}
                    onChange={() => setProfileType(profile.key)}
                    className="h-4 w-4 accent-forest-700"
                  />

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                      active
                        ? 'bg-white text-forest-700 shadow-sm'
                        : 'bg-ink-50 text-ink-500 group-hover:scale-105'
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="relative z-10 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">{profile.label}</p>

                      {active && (
                        <span className="rounded-full border border-forest-200 bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-forest-800">
                          Selected
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-ink-500">{profile.description}</p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          ALERT THRESHOLD
      ====================================================== */}
      <section className="fade-up">
        <div className="rounded-[26px] border border-ink-100 bg-surface p-6 shadow-soft sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                  <BellRing size={17} />
                </div>

                <div>
                  <h2 className="font-display text-lg font-semibold text-ink-900">
                    Alert Threshold
                  </h2>

                  <p className="mt-0.5 text-xs text-ink-500">
                    You'll be alerted when AQI exceeds this value at a saved location.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-forest-100 bg-forest-50 px-4 py-2.5 text-right">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-forest-700/70">
                Current threshold
              </p>

              <p className="mt-0.5 font-mono text-xl font-bold text-forest-800">AQI {threshold}</p>
            </div>
          </div>

          <div className="mt-7">
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="w-full accent-forest-700"
              aria-label="AQI alert threshold"
            />

            <div className="mt-2 flex justify-between text-[9px] font-medium text-ink-400">
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>250</span>
              <span>300</span>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-ink-100 bg-ink-50/60 p-4">
            <SlidersHorizontal size={15} className="mt-0.5 shrink-0 text-ink-500" />

            <p className="text-xs leading-5 text-ink-500">
              Lower thresholds trigger alerts sooner, while higher thresholds reduce the number of
              notifications. Choose a value that matches how frequently you want to be informed.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          SAVE BAR
      ====================================================== */}
      <section className="fade-up">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleSave}
            className="btn-premium inline-flex w-fit items-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-forest-800"
          >
            <ShieldCheck size={15} />
            Save Preferences
          </button>

          {saved && (
            <div className="notification-enter inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-4 py-2.5 text-sm font-medium text-forest-800">
              <CheckCircle2 size={15} />
              Preferences saved successfully.
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          PERSONALIZATION NOTE
      ====================================================== */}
      <section className="fade-up">
        <div className="relative overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-forest-400/10 blur-3xl float-soft" />

          <div className="relative flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 shadow-sm">
              <Sparkles size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900">Why your profile matters</p>

              <p className="mt-1 text-xs leading-6 text-ink-600">
                AeroGuard can use your selected sensitivity profile to present more relevant
                environmental risk guidance and activity context. This personalization is intended
                for informational support, not diagnosis or treatment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
