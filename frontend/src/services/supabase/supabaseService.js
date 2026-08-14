import { supabase } from './supabaseClient'
import { getAqiCategory } from '../../utils/riskEngine/riskEngine'

export async function fetchUserProfile(userId) {
  if (!userId) return null
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error && error.code !== 'PGRST116') console.warn('Profile fetch error:', error)
    return data || null
  } catch (err) {
    console.warn('Failed to fetch user profile:', err)
    return null
  }
}

export async function updateUserProfile(userId, updates) {
  if (!userId) return null
  try {
    const payload = { ...updates, updated_at: new Date().toISOString() }
    const { data, error } = await supabase.from('profiles').upsert({ id: userId, ...payload }).select().single()
    if (error) throw error
    return data
  } catch (err) {
    console.error('Error updating user profile:', err)
    throw err
  }
}

export async function fetchSavedLocations(userId) {
  if (!userId) return []
  try {
    const { data, error } = await supabase.from('saved_locations').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Error fetching saved locations:', err)
    return []
  }
}

export async function saveLocationToDb(userId, locationData) {
  if (!userId) throw new Error('Must be logged in to save locations.')
  try {
    const payload = {
      user_id: userId,
      name: locationData.name,
      region: locationData.region || '',
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: locationData.address || `${locationData.name}, ${locationData.region || ''}`,
      location_type: locationData.location_type || locationData.type || 'Favorite',
      alert_threshold: locationData.alert_threshold || 100,
      is_active: true,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('saved_locations').insert([payload]).select().single()
    if (error) throw error
    return data
  } catch (err) {
    console.error('Error saving location:', err)
    throw err
  }
}

export async function removeSavedLocationFromDb(userId, locationId) {
  if (!userId || !locationId) return false
  try {
    const { error } = await supabase.from('saved_locations').delete().eq('id', locationId).eq('user_id', userId)
    if (error) throw error
    return true
  } catch (err) {
    console.error('Error deleting saved location:', err)
    throw err
  }
}

export async function recordAirQualitySnapshot(userId, locationName, airData, locationId = null) {
  if (!userId || !airData || !airData.aqi) return null
  try {
    const category = getAqiCategory(airData.aqi)
    const payload = {
      user_id: userId,
      location_id: locationId,
      location_name: locationName,
      aqi: airData.aqi,
      pm25: airData.pm25 || airData.pm2_5 || null,
      pm10: airData.pm10 || null,
      no2: airData.no2 || null,
      o3: airData.o3 || null,
      co: airData.co || null,
      so2: airData.so2 || null,
      risk_level: category.label,
      recorded_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('air_quality_snapshots').insert([payload]).select().single()
    if (error) console.warn('Snapshot record warning:', error.message)
    return data || null
  } catch (err) {
    console.warn('Failed to record snapshot:', err)
    return null
  }
}

export async function fetchHistoricalSnapshots(userId, locationName = null, days = 7) {
  if (!userId) return []
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    let query = supabase.from('air_quality_snapshots').select('*').eq('user_id', userId).gte('recorded_at', startDate.toISOString()).order('recorded_at', { ascending: true })
    if (locationName) query = query.eq('location_name', locationName)
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Error fetching snapshots:', err)
    return []
  }
}

export async function fetchUserAlerts(userId) {
  if (!userId) return []
  try {
    const { data, error } = await supabase.from('alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Error fetching alerts:', err)
    return []
  }
}

export async function markAlertReadInDb(userId, alertId) {
  if (!userId || !alertId) return false
  try {
    const { error } = await supabase.from('alerts').update({ is_read: true }).eq('id', alertId).eq('user_id', userId)
    if (error) throw error
    return true
  } catch (err) {
    console.error('Error marking alert as read:', err)
    return false
  }
}

export async function checkAndTriggerAlert(userId, locationName, aqi, userThreshold = 100, locationId = null) {
  if (!userId || !aqi) return null
  if (aqi >= userThreshold) {
    const category = getAqiCategory(aqi)
    const severity = aqi >= 200 ? 'critical' : aqi >= 150 ? 'warning' : 'info'
    try {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      const { data: existing } = await supabase.from('alerts').select('id').eq('user_id', userId).eq('location_name', locationName).gte('created_at', sixHoursAgo)
      if (existing && existing.length > 0) return null
      const alertPayload = {
        user_id: userId,
        location_id: locationId,
        location_name: locationName,
        severity,
        risk_level: category.label,
        aqi,
        title: `Air Quality Alert: ${locationName}`,
        message: `Air quality at ${locationName} reached AQI ${aqi} (${category.label}), exceeding your threshold of ${userThreshold}.`,
        is_read: false,
        created_at: new Date().toISOString(),
      }
      const { data, error } = await supabase.from('alerts').insert([alertPayload]).select().single()
      if (error) throw error
      return data
    } catch (err) {
      console.warn('Error creating threshold alert:', err)
      return null
    }
  }
  return null
}
