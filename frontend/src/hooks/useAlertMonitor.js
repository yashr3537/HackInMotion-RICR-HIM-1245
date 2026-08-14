import { useEffect, useCallback } from 'react'
import { fetchSavedLocations, checkAndTriggerAlert } from '../services/supabase/supabaseService'
import { getAirQuality } from '../services/airQuality/airQualityApi'

export function useAlertMonitor(userId) {
  const checkAlertsNow = useCallback(async () => {
    if (!userId) return

    try {
      const locations = await fetchSavedLocations(userId)
      if (!Array.isArray(locations) || locations.length === 0) return

      for (const loc of locations) {
        if (loc.latitude && loc.longitude) {
          const aqData = await getAirQuality(loc.latitude, loc.longitude)
          if (aqData && aqData.aqi !== null && aqData.aqi !== undefined) {
            await checkAndTriggerAlert(userId, loc, aqData.aqi)
          }
        }
      }
    } catch (err) {
      console.warn('useAlertMonitor check error:', err)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    // Run initial check
    checkAlertsNow()

    // Poll every 15 minutes (15 * 60 * 1000 ms)
    const interval = setInterval(
      () => {
        checkAlertsNow()
      },
      15 * 60 * 1000
    )

    return () => clearInterval(interval)
  }, [userId, checkAlertsNow])

  return { checkAlertsNow }
}
