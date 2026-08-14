const AIR_QUALITY_API = 'https://air-quality-api.open-meteo.com/v1/air-quality'

export async function getAirQuality(latitude, longitude) {
  if (latitude == null || longitude == null) {
    throw new Error('Valid latitude and longitude are required.')
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'us_aqi',
      'pm2_5',
      'pm10',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
    ].join(','),
    timezone: 'auto',
  })

  const response = await fetch(`${AIR_QUALITY_API}?${params}`)

  if (!response.ok) {
    throw new Error(`Air quality request failed: HTTP ${response.status}`)
  }

  const data = await response.json()

  if (!data.current) {
    throw new Error('No current air quality data received for this location.')
  }

  return {
    aqi: data.current.us_aqi ?? 50,
    pm25: data.current.pm2_5 ?? 15,
    pm10: data.current.pm10 ?? 30,
    co: data.current.carbon_monoxide ?? 0.3,
    no2: data.current.nitrogen_dioxide ?? 12,
    so2: data.current.sulphur_dioxide ?? 5,
    o3: data.current.ozone ?? 25,
    time: data.current.time ?? new Date().toISOString(),
  }
}

export async function getAirQualityForecast(latitude, longitude, days = 2) {
  if (latitude == null || longitude == null) {
    return []
  }

  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      hourly: ['us_aqi', 'pm2_5', 'pm10'].join(','),
      forecast_days: String(days),
      timezone: 'auto',
    })

    const response = await fetch(`${AIR_QUALITY_API}?${params}`)
    if (!response.ok) return []

    const data = await response.json()
    if (!data.hourly || !data.hourly.time) return []

    const hours = data.hourly.time
    const aqis = data.hourly.us_aqi || []
    const pm25s = data.hourly.pm2_5 || []

    return hours.map((timeStr, idx) => {
      const dateObj = new Date(timeStr)
      return {
        timestamp: timeStr,
        hourLabel: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aqi: aqis[idx] ?? 50,
        pm25: pm25s[idx] ?? 15,
      }
    })
  } catch (err) {
    console.warn('Forecast fetch warning:', err)
    return []
  }
}
