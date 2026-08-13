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