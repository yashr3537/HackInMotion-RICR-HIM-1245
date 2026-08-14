/**
 * @deprecated Deprecated in favor of Supabase database table `saved_locations` via `src/services/supabase/supabaseService.js`.
 * All location persistence and monitoring now sync directly with Supabase.
 */

import { fallbackSavedLocations as defaultLocations } from './fallbackData'

export function getSavedLocationsKey(userId) {
  return `airguard_saved_locations_${userId || 'guest'}`
}

export function loadUserSavedLocations(userId) {
  console.warn(
    'loadUserSavedLocations is deprecated. Use fetchSavedLocations(userId) from supabaseService.js'
  )
  return []
}

export function saveUserSavedLocations(locations, userId) {
  console.warn(
    'saveUserSavedLocations is deprecated. Use saveLocationToDb(userId, loc) from supabaseService.js'
  )
}

export function removeUserSavedLocation(locationTarget, userId) {
  console.warn(
    'removeUserSavedLocation is deprecated. Use removeSavedLocationFromDb(userId, id) from supabaseService.js'
  )
  return []
}

export function addUserSavedLocation(newLocation, userId) {
  console.warn(
    'addUserSavedLocation is deprecated. Use saveLocationToDb(userId, loc) from supabaseService.js'
  )
  return []
}
