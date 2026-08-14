import { supabase } from './supabaseClient'

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export async function fetchUserProfile(userId) {
  if (!userId) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('fetchUserProfile error:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('fetchUserProfile exception:', err)
    return null
  }
}

export async function updateUserProfile(userId, updates) {
  if (!userId) throw new Error('User ID is required to update profile.')
  try {
    const payload = {
      name: updates.name,
      full_name: updates.fullName || updates.full_name,
      profile_type: updates.profileType || updates.profile_type,
      alert_threshold: updates.alertThreshold ?? updates.alert_threshold ?? 100,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('updateUserProfile error:', error)
      throw new Error(error.message)
    }

    return data
  } catch (err) {
    console.error('updateUserProfile exception:', err)
    throw err
  }
}

// ---------------------------------------------------------------------------
// Saved Locations
// ---------------------------------------------------------------------------

export async function fetchSavedLocations(userId) {
  if (!userId) return []
  try {
    const { data, error } = await supabase
      .from('saved_locations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetchSavedLocations error:', error)
      return []
    }

    return (data || []).map((item) => ({
      id: item.id,
      type: item.type || 'Custom',
      icon: item.icon || 'star',
      name: item.name || item.city,
      region: item.region || item.state || '',
      latitude: item.latitude,
      longitude: item.longitude,
      alertThreshold: item.alert_threshold || 100,
      aqi: item.aqi || null,
      lastUpdated: item.updated_at ? new Date(item.updated_at).toLocaleTimeString() : 'Recently',
    }))
  } catch (err) {
    console.error('fetchSavedLocations exception:', err)
    return []
  }
}

export async function saveLocationToDb(userId, location) {
  if (!userId) return null
  try {
    const payload = {
      user_id: userId,
      name: location.name,
      region: location.region || '',
      country: location.country || '',
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      type: location.type || 'Custom',
      icon: location.icon || 'star',
      alert_threshold: location.alertThreshold || 100,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('saved_locations')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.error('saveLocationToDb error:', error)
      throw new Error(error.message)
    }

    return {
      id: data.id,
      type: data.type,
      icon: data.icon,
      name: data.name,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
      alertThreshold: data.alert_threshold,
    }
  } catch (err) {
    console.error('saveLocationToDb exception:', err)
    throw err
  }
}

export async function removeSavedLocationFromDb(userId, locationId) {
  if (!userId || !locationId) return false
  try {
    const { error } = await supabase
      .from('saved_locations')
      .delete()
      .eq('user_id', userId)
      .eq('id', locationId)

    if (error) {
      console.error('removeSavedLocationFromDb error:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('removeSavedLocationFromDb exception:', err)
    return false
  }
}

// ---------------------------------------------------------------------------
// Air Quality Snapshots
// ---------------------------------------------------------------------------

export async function recordAirQualitySnapshot(userId, location, aqiData) {
  if (!aqiData || aqiData.aqi === null || aqiData.aqi === undefined) return null
  try {
    const payload = {
      user_id: userId || null,
      location_name: location?.name || 'Current Location',
      latitude: location?.latitude ? Number(location.latitude) : null,
      longitude: location?.longitude ? Number(location.longitude) : null,
      aqi: Number(aqiData.aqi),
      pm25: aqiData.pm25 !== null && aqiData.pm25 !== undefined ? Number(aqiData.pm25) : null,
      pm10: aqiData.pm10 !== null && aqiData.pm10 !== undefined ? Number(aqiData.pm10) : null,
      co: aqiData.co !== null && aqiData.co !== undefined ? Number(aqiData.co) : null,
      no2: aqiData.no2 !== null && aqiData.no2 !== undefined ? Number(aqiData.no2) : null,
      so2: aqiData.so2 !== null && aqiData.so2 !== undefined ? Number(aqiData.so2) : null,
      o3: aqiData.o3 !== null && aqiData.o3 !== undefined ? Number(aqiData.o3) : null,
      recorded_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('air_quality_snapshots')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.warn('recordAirQualitySnapshot warning:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.warn('recordAirQualitySnapshot exception:', err)
    return null
  }
}

export async function fetchHistoricalSnapshots(userId, locationId, timeRange = '24h') {
  try {
    let query = supabase
      .from('air_quality_snapshots')
      .select('*')
      .order('recorded_at', { ascending: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      return null
    }

    const validSnapshots = data.filter((s) => s.aqi !== null && !isNaN(s.aqi))
    if (validSnapshots.length === 0) return null

    const aqis = validSnapshots.map((s) => Number(s.aqi))
    const avg = Math.round(aqis.reduce((a, b) => a + b, 0) / aqis.length)
    const best = Math.min(...aqis)
    const worst = Math.max(...aqis)

    const firstAqi = aqis[0]
    const lastAqi = aqis[aqis.length - 1]
    const changePercent = Math.round(((lastAqi - firstAqi) / (firstAqi || 1)) * 100)

    const trendDirection = lastAqi < firstAqi ? 'improving' : lastAqi > firstAqi ? 'worsening' : 'stable'

    return {
      snapshots: validSnapshots.map((s) => ({
        label: new Date(s.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aqi: s.aqi,
        pm25: s.pm25,
        pm10: s.pm10,
      })),
      stats: { avg, best, worst, changePercent },
      trendDirection,
    }
  } catch (err) {
    console.error('fetchHistoricalSnapshots exception:', err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export async function fetchUserAlerts(userId) {
  if (!userId) return []
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetchUserAlerts error:', error)
      return []
    }

    return (data || []).map((a) => ({
      id: a.id,
      severity: a.severity || 'warning',
      title: a.title,
      message: a.message,
      aqi: a.aqi,
      time: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
      read: Boolean(a.read),
      location: a.location_name || '',
    }))
  } catch (err) {
    console.error('fetchUserAlerts exception:', err)
    return []
  }
}

export async function markAlertReadInDb(alertId) {
  if (!alertId) return false
  try {
    const { error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('id', alertId)

    if (error) {
      console.error('markAlertReadInDb error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('markAlertReadInDb exception:', err)
    return false
  }
}

export async function checkAndTriggerAlert(userId, location, aqi) {
  if (!userId || !location || aqi === null || aqi === undefined) return null

  const numAqi = Number(aqi)
  const threshold = Number(location.alertThreshold || 100)

  if (numAqi >= threshold) {
    const locName = location.name || 'Saved Location'
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()

    try {
      // 1. Spam protection: Check if an alert for this location was inserted in the last 6 hours
      const { data: recentAlerts, error: checkError } = await supabase
        .from('alerts')
        .select('id')
        .eq('user_id', userId)
        .eq('location_name', locName)
        .gte('created_at', sixHoursAgo)

      if (checkError) {
        console.warn('checkAndTriggerAlert duplicate check warning:', checkError.message)
      }

      if (recentAlerts && recentAlerts.length > 0) {
        // Alert already generated in the last 6 hours, skip to prevent spam
        return null
      }

      // 2. Decide severity: AQI >= 200 => 'critical', AQI >= threshold => 'warning'
      const severity = numAqi >= 200 ? 'critical' : 'warning'
      const title = severity === 'critical' ? 'Critical Air Pollution Alert' : 'Air Quality Warning'

      const payload = {
        user_id: userId,
        location_name: locName,
        title,
        message: `Air quality index at ${locName} has reached ${numAqi}, exceeding your set threshold of ${threshold}.`,
        severity,
        aqi: numAqi,
        read: false,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('alerts')
        .insert([payload])
        .select()
        .single()

      if (error) {
        console.warn('checkAndTriggerAlert insert warning:', error.message)
        return null
      }

      return data
    } catch (err) {
      console.warn('checkAndTriggerAlert exception:', err)
      return null
    }
  }

  return null
}
