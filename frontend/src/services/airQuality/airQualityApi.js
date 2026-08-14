const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const AIR_QUALITY_API = BACKEND_URL
  ? `${BACKEND_URL}/api/air-quality`
  : 'https://air-quality-api.open-meteo.com/v1/air-quality'
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'

export async function getAirQuality(latitude, longitude) {
  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
    return null
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

  try {
    const response = await fetch(`${AIR_QUALITY_API}?${params}`)

    if (!response.ok) {
      throw new Error(`Air quality request failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data.current) {
      return null
    }

    return {
      aqi: data.current.us_aqi !== undefined ? data.current.us_aqi : null,
      pm25: data.current.pm2_5 !== undefined ? data.current.pm2_5 : null,
      pm10: data.current.pm10 !== undefined ? data.current.pm10 : null,
      co: data.current.carbon_monoxide !== undefined ? data.current.carbon_monoxide : null,
      no2: data.current.nitrogen_dioxide !== undefined ? data.current.nitrogen_dioxide : null,
      so2: data.current.sulphur_dioxide !== undefined ? data.current.sulphur_dioxide : null,
      o3: data.current.ozone !== undefined ? data.current.ozone : null,
      time: data.current.time || null,
    }
  } catch (err) {
    console.error('getAirQuality error:', err)
    return null
  }
}

export async function getWeather(latitude, longitude) {
  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
    return null
  }

  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'surface_pressure',
        'wind_speed_10m',
      ].join(','),
      timezone: 'auto',
    })

    const response = await fetch(`${WEATHER_API}?${params}`)
    if (!response.ok) return null

    const data = await response.json()
    if (!data.current) return null

    return {
      temperature: data.current.temperature_2m !== undefined ? data.current.temperature_2m : null,
      humidity: data.current.relative_humidity_2m !== undefined ? data.current.relative_humidity_2m : null,
      pressure: data.current.surface_pressure !== undefined ? data.current.surface_pressure : null,
      windSpeed: data.current.wind_speed_10m !== undefined ? data.current.wind_speed_10m : null,
    }
  } catch (e) {
    console.error('getWeather error:', e)
    return null
  }
}

export async function getAirQualityForecast(latitude, longitude) {
  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
    return []
  }

  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      hourly: ['us_aqi', 'pm2_5', 'pm10'].join(','),
      forecast_days: '2',
      timezone: 'auto',
    })

    const response = await fetch(`${AIR_QUALITY_API}?${params}`)
    if (!response.ok) return []

    const data = await response.json()
    if (!data.hourly || !data.hourly.time) return []

    const result = []
    const times = data.hourly.time
    const aqis = data.hourly.us_aqi || []
    const pm25s = data.hourly.pm2_5 || []
    const pm10s = data.hourly.pm10 || []

    for (let i = 0; i < times.length; i++) {
      result.push({
        time: times[i],
        aqi: aqis[i] !== undefined ? aqis[i] : null,
        pm25: pm25s[i] !== undefined ? pm25s[i] : null,
        pm10: pm10s[i] !== undefined ? pm10s[i] : null,
      })
    }

    return result
  } catch (e) {
    console.error('getAirQualityForecast error:', e)
    return []
  }
}
