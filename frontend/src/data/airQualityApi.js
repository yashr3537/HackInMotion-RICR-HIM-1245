const AIR_QUALITY_API =
  'https://air-quality-api.open-meteo.com/v1/air-quality'

export async function getAirQuality(latitude, longitude) {
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
    throw new Error(`Air quality request failed: ${response.status}`)
  }

  const data = await response.json()

  if (!data.current) {
    throw new Error('No current air quality data received.')
  }

  return {
    aqi: data.current.us_aqi ?? null,
    pm25: data.current.pm2_5 ?? null,
    pm10: data.current.pm10 ?? null,
    co: data.current.carbon_monoxide ?? null,
    no2: data.current.nitrogen_dioxide ?? null,
    so2: data.current.sulphur_dioxide ?? null,
    o3: data.current.ozone ?? null,
    time: data.current.time ?? null,
  }
}

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'

export async function getWeather(latitude, longitude) {
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
      temperature: data.current.temperature_2m ?? null,
      humidity: data.current.relative_humidity_2m ?? null,
      pressure: data.current.surface_pressure ?? null,
      windSpeed: data.current.wind_speed_10m ?? null,
    }
  } catch (e) {
    console.error('Weather fetch error:', e)
    return null
  }
}