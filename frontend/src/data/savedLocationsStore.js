import { savedLocations as defaultLocations } from './demoData'

export function getSavedLocationsKey(userId) {
  return `airguard_saved_locations_${userId || 'guest'}`
}

export function loadUserSavedLocations(userId) {
  const key = getSavedLocationsKey(userId)
  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load saved locations:', e)
  }

  // Initialize with default demo saved locations on first run
  try {
    localStorage.setItem(key, JSON.stringify(defaultLocations))
  } catch (e) {}

  return defaultLocations
}

export function saveUserSavedLocations(locations, userId) {
  const key = getSavedLocationsKey(userId)
  try {
    localStorage.setItem(key, JSON.stringify(locations))
  } catch (e) {
    console.error('Failed to persist saved locations:', e)
  }
}

export function removeUserSavedLocation(locationTarget, userId) {
  const current = loadUserSavedLocations(userId)

  const targetId = typeof locationTarget === 'object' && locationTarget !== null ? locationTarget.id : locationTarget
  const targetName = typeof locationTarget === 'object' && locationTarget !== null ? locationTarget.name : locationTarget

  const updated = current.filter((loc) => {
    if (targetId && String(loc.id) === String(targetId)) return false
    if (locationTarget && String(loc.id) === String(locationTarget)) return false
    if (targetName && loc.name.toLowerCase() === String(targetName).toLowerCase()) {
      if (loc.id && targetId && String(loc.id) !== String(targetId)) return true
      return false
    }
    return true
  })

  saveUserSavedLocations(updated, userId)
  return updated
}

export function addUserSavedLocation(newLocation, userId) {
  const current = loadUserSavedLocations(userId)
  const exists = current.some(
    (loc) =>
      String(loc.id) === String(newLocation.id) ||
      (loc.name.toLowerCase() === newLocation.name.toLowerCase() && loc.region === newLocation.region)
  )

  if (exists) return current

  const locationToAdd = {
    ...newLocation,
    id: newLocation.id || `loc_${Date.now()}`,
    type: newLocation.type || 'Custom',
    icon: newLocation.icon || 'star',
  }

  const updated = [locationToAdd, ...current]
  saveUserSavedLocations(updated, userId)
  return updated
}
