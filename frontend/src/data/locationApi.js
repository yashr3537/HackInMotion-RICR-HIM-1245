const GEOCODING_API =
  'https://geocoding-api.open-meteo.com/v1/search'

export async function searchLocation(query) {
  const trimmedQuery = String(query || '').trim()

  if (!trimmedQuery) {
    return []
  }

  const params = new URLSearchParams({
    name: trimmedQuery,
    count: '5',
    language: 'en',
    format: 'json',
  })

  const response = await fetch(`${GEOCODING_API}?${params}`)

  if (!response.ok) {
    throw new Error(`Location search failed: ${response.status}`)
  }

  const data = await response.json()

  return (data.results || []).map((location) => ({
    id: `${location.id}`,
    name: location.name,
    region: location.admin1 || '',
    country: location.country || '',
    latitude: location.latitude,
    longitude: location.longitude,
  }))
}

export async function reverseGeocode(latitude, longitude) {
  const lat = Number(latitude)
  const lon = Number(longitude)

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { name: 'Current location', region: '', country: '' }
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
    )
    if (response.ok) {
      const data = await response.json()
      const addr = data.address || {}
      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.suburb ||
        addr.county ||
        addr.state_district
      const region = addr.state || addr.country || ''
      const country = addr.country || ''
      if (city) {
        return { name: city, region, country }
      }
    }
  } catch (e) {
    console.error('Reverse geocode error (Nominatim):', e)
  }

  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    )
    if (response.ok) {
      const data = await response.json()
      const city = data.city || data.locality || data.principalSubdivision
      const region = data.principalSubdivision || data.countryName || ''
      const country = data.countryName || ''
      if (city) {
        return { name: city, region, country }
      }
    }
  } catch (e) {
    console.error('Reverse geocode error (BigDataCloud):', e)
  }

  return { name: 'Current location', region: '', country: '' }
}