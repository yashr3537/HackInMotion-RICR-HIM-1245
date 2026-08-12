import { useState } from 'react'
import { Baby, PersonStanding, Wind as LungIcon, HardHat, User as UserIcon } from 'lucide-react'
import { useAuth } from '../auth'

const PROFILES = [
  { key: 'general', label: 'General', icon: UserIcon, description: 'Standard sensitivity to air quality changes.' },
  { key: 'child', label: 'Child', icon: Baby, description: 'Higher sensitivity due to developing lungs.' },
  { key: 'elderly', label: 'Elderly', icon: PersonStanding, description: 'Increased risk from prolonged exposure.' },
  { key: 'respiratory', label: 'Respiratory Sensitive', icon: LungIcon, description: 'Asthma or other respiratory conditions.' },
  { key: 'outdoor-worker', label: 'Outdoor Worker', icon: HardHat, description: 'Extended daily outdoor exposure.' },
]

export default function Profile() {
  const { currentUser, updateCurrentUser } = useAuth()
  const [profileType, setProfileType] = useState(currentUser.profileType)
  const [threshold, setThreshold] = useState(currentUser.alertThreshold)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    updateCurrentUser({ profileType, alertThreshold: threshold })
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink-900">Profile</h1>
        <p className="text-ink-500 text-sm mt-1.5">Manage your account and environmental sensitivity settings.</p>
      </div>

      <div className="bg-surface rounded-xl2 border border-ink-100 shadow-soft p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-forest-700 text-white flex items-center justify-center text-2xl font-display font-semibold shrink-0">
          {currentUser.name.charAt(0)}
        </div>
        <div>
          <p className="font-display font-semibold text-lg text-ink-900">{currentUser.fullName}</p>
          <p className="text-sm text-ink-500">{currentUser.email}</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl2 border border-ink-100 shadow-soft p-6">
        <h2 className="font-display font-semibold text-ink-900 mb-1">Environmental Profile</h2>
        <p className="text-sm text-ink-500 mb-5">Used to personalize risk levels and activity recommendations.</p>
        <div className="flex flex-col gap-2.5">
          {PROFILES.map((p) => {
            const Icon = p.icon
            const active = profileType === p.key
            return (
              <label
                key={p.key}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3.5 cursor-pointer transition-colors ${
                  active ? 'border-forest-500 bg-forest-50' : 'border-ink-100 hover:border-ink-200'
                }`}
              >
                <input
                  type="radio"
                  name="profileType"
                  checked={active}
                  onChange={() => setProfileType(p.key)}
                  className="accent-forest-700 w-4 h-4"
                />
                <Icon size={18} className={active ? 'text-forest-700' : 'text-ink-500'} />
                <div>
                  <p className="text-sm font-semibold text-ink-900">{p.label}</p>
                  <p className="text-xs text-ink-500">{p.description}</p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      <div className="bg-surface rounded-xl2 border border-ink-100 shadow-soft p-6">
        <h2 className="font-display font-semibold text-ink-900 mb-1">Alert Threshold</h2>
        <p className="text-sm text-ink-500 mb-5">You'll be alerted when AQI exceeds this value at a saved location.</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="50"
            max="300"
            step="10"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="flex-1 accent-forest-700"
          />
          <span className="font-mono font-bold text-xl text-ink-900 w-16 text-right">AQI {threshold}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm px-5 py-3 rounded-lg transition-colors"
        >
          Save Preferences
        </button>
        {saved && <span className="text-sm text-forest-700 font-medium">Preferences saved.</span>}
      </div>
    </div>
  )
}
