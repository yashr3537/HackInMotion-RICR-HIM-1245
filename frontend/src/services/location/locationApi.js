const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search'
const REVERSE_GEO_API = 'https://nominatim.openstreetmap.org/reverse'

export async function searchLocation(query) {
  const trimmedQuery = String(query || '').trim()

  if (!trimmedQuery) {
    return []
  }

  const params = new URLSearchParams({
    name: trimmedQuery,
    count: '8',
    language: 'en',
    format: 'json',
  })

  const response = await fetch(`${GEOCODING_API}?${params}`)

  if (!response.ok) {
    throw new Error(`Location search failed: HTTP ${response.status}`)
  }

  const data = await response.json()

  return (data.results || []).map((location) => ({
    id: `loc-${location.id}`,
    name: location.name,
    region: location.admin1 || location.country || '',
    country: location.country || '',
    latitude: location.latitude,
    longitude: location.longitude,
    displayName: `${location.name}${location.admin1 ? `, ${location.admin1}` : ''}${location.country ? `, ${location.country}` : ''}`,
  }))
}

export async function reverseGeocode(latitude, longitude) {
  if (latitude == null || longitude == null) {
    return { name: 'Current Location', region: 'Local Device', latitude, longitude }
  }

  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: 'json',
    })

    const response = await fetch(`${REVERSE_GEO_API}?${params}`, {
      headers: {
        'User-Agent': 'AirGuard-HackathonApp/1.0',
      },
    })

    if (!response.ok) {
      return { name: 'Current Location', region: 'Device Coordinates', latitude, longitude }
    }

    const data = await response.json()
    const address = data.address || {}
    const name = address.city || address.town || address.village || address.suburb || address.county || 'Current Location'
    const region = address.state || address.country || ''

    return {
      name,
      region,
      latitude,
      longitude,
      displayName: `${name}${region ? `, ${region}` : ''}`,
    }
  } catch (err) {
    console.warn('Reverse geocoding error:', err)
    return { name: 'Current Location', region: 'Device Coordinates', latitude, longitude }
  }
}
