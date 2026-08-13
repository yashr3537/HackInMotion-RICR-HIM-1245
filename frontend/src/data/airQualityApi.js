const AIR_QUALITY_API = 'https://air-quality-api.open-meteo.com/v1/air-quality'

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
    throw new Error('Unable to fetch air quality data.')
  }

  const data = await response.json()

  return {
    aqi: data.current?.us_aqi ?? null,
    pm25: data.current?.pm2_5 ?? null,
    pm10: data.current?.pm10 ?? null,
    co: data.current?.carbon_monoxide ?? null,
    no2: data.current?.nitrogen_dioxide ?? null,
    so2: data.current?.sulphur_dioxide ?? null,
    o3: data.current?.ozone ?? null,
    time: data.current?.time ?? null,
  }
}