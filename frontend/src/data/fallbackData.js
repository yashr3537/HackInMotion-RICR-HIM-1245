// Offline / Emergency fallback data when network or Supabase is unreachable

export const fallbackCurrentLocation = {
  id: 'loc-bhopal-home',
  name: 'Bhopal',
  region: 'Madhya Pradesh',
  aqi: 82,
  lastUpdated: 'Recently',
  pm25: 28,
  pm10: 54,
}

export const fallbackPollutants = [
  { key: 'pm25', label: 'PM2.5', value: 28, unit: 'µg/m³', status: 'moderate', description: 'Fine particulate matter' },
  { key: 'pm10', label: 'PM10', value: 54, unit: 'µg/m³', status: 'moderate', description: 'Coarse particulate matter' },
  { key: 'no2', label: 'NO₂', value: 19, unit: 'µg/m³', status: 'good', description: 'Nitrogen dioxide' },
  { key: 'o3', label: 'O₃', value: 31, unit: 'µg/m³', status: 'good', description: 'Ground-level ozone' },
  { key: 'so2', label: 'SO₂', value: 8, unit: 'µg/m³', status: 'good', description: 'Sulfur dioxide' },
  { key: 'co', label: 'CO', value: 0.4, unit: 'mg/m³', status: 'good', description: 'Carbon monoxide' },
]

export const fallbackSavedLocations = [
  {
    id: 'loc-home',
    type: 'Home',
    icon: 'home',
    name: 'Bhopal',
    region: 'Arera Colony',
    latitude: 23.2599,
    longitude: 77.4126,
    aqi: 82,
    lastUpdated: 'Recently',
    alertThreshold: 100,
  },
  {
    id: 'loc-college',
    type: 'College',
    icon: 'school',
    name: 'Bhopal',
    region: 'MANIT Campus',
    latitude: 23.2144,
    longitude: 77.4042,
    aqi: 91,
    lastUpdated: 'Recently',
    alertThreshold: 100,
  },
]
