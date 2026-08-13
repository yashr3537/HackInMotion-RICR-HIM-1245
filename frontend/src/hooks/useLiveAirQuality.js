import { useState, useEffect, useCallback } from 'react'
import { getAirQuality } from '../data/airQualityApi'
import { reverseGeocode } from '../data/locationApi'

function formatLastUpdated(timeStr) {
  if (!timeStr) {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  try {
    const d = new Date(timeStr)
    if (isNaN(d.getTime())) {
      return timeStr
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return timeStr
  }
}

/**
 * Reusable hook to fetch live air quality data.
 * @param {Object} [overrideLocation] - Optional explicit location object { latitude, longitude, name, region }
 * @param {Object} [options] - Options like pollingInterval
 */
export function useLiveAirQuality(overrideLocation = null, options = {}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const fetchLiveAQI = useCallback(async () => {
    setLoading(true)
    setError(null)

    let targetLat = overrideLocation?.latitude
    let targetLon = overrideLocation?.longitude
    let targetName = overrideLocation?.name
    let targetRegion = overrideLocation?.region
    let isDeviceLoc = false

    // Check localStorage if no override passed
    if (targetLat === undefined || targetLon === undefined) {
      try {
        const stored = localStorage.getItem('selectedAirGuardLocation')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
            targetLat = parsed.latitude
            targetLon = parsed.longitude
            targetName = parsed.name
            targetRegion = parsed.region
          }
        }
      } catch (e) {
        console.error('Failed to read selectedAirGuardLocation:', e)
      }
    }

    // If still no location, try device geolocation
    if (targetLat === undefined || targetLon === undefined) {
      if (!navigator.geolocation) {
        targetLat = 23.2599
        targetLon = 77.4126
        targetName = 'Bhopal'
        targetRegion = 'Madhya Pradesh'
      } else {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 6000,
              maximumAge: 300000,
            })
          })
          targetLat = position.coords.latitude
          targetLon = position.coords.longitude
          isDeviceLoc = true
        } catch (geoErr) {
          console.warn('Geolocation denied or timed out, using default location:', geoErr)
          targetLat = 23.2599
          targetLon = 77.4126
          targetName = 'Bhopal'
          targetRegion = 'Madhya Pradesh'
        }
      }
    }

    // Perform reverse geocoding if name is not available
    if (!targetName) {
      const geo = await reverseGeocode(targetLat, targetLon)
      targetName = geo.name
      targetRegion = geo.region
    }

    // Fetch live AQI from Open-Meteo API
    try {
      const aq = await getAirQuality(targetLat, targetLon)

      if (aq.aqi === null && aq.pm25 === null) {
        throw new Error('No valid air quality readings returned.')
      }

      setData({
        name: targetName || 'Current location',
        region: targetRegion || '',
        latitude: targetLat,
        longitude: targetLon,
        aqi: aq.aqi,
        pm25: aq.pm25,
        pm10: aq.pm10,
        co: aq.co,
        no2: aq.no2,
        so2: aq.so2,
        o3: aq.o3,
        time: aq.time,
        lastUpdated: formatLastUpdated(aq.time),
        source: 'Open-Meteo',
        isDeviceLocation: isDeviceLoc,
      })
      setError(null)
    } catch (err) {
      console.error('Live air quality fetch error:', err)
      setError('Live air quality data is currently unavailable.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [overrideLocation?.latitude, overrideLocation?.longitude, overrideLocation?.name, overrideLocation?.region])

  useEffect(() => {
    fetchLiveAQI()

    // 15-minute polling interval if enabled
    const intervalMs = options.pollingInterval || 15 * 60 * 1000
    const interval = setInterval(() => {
      fetchLiveAQI()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [fetchLiveAQI, options.pollingInterval])

  return {
    loading,
    error,
    data,
    refetch: fetchLiveAQI,
  }
}
