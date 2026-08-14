import { getAirQuality } from '../data/airQualityApi'
import { searchLocation } from '../data/locationApi'
import { getAqiBand } from '../data/aqiUtils'

const DEFAULT_FALLBACK_LOCATION = {
  name: 'Bhopal',
  region: 'Madhya Pradesh',
}

const STOP_WORDS = new Set([
  'air', 'quality', 'aqi', 'ka', 'ki', 'kya', 'hai', 'batao', 'bata', 'mere', 'my',
  'home', 'area', 'location', 'what', 'is', 'how', 'the', 'a', 'an', 'for', 'in', 'on',
  'at', 'of', 'to', 'and', 'me', 'tell', 'show', 'check', 'current', 'now', 'today',
  'please', 'can', 'i', 'do', 'should', 'go', 'jogging', 'jog', 'run', 'running',
  'walk', 'walking', 'cycle', 'cycling', 'sports', 'outdoor', 'alert', 'alerts', 'status',
  'situation', 'weather', 'voice', 'assistant', 'ask', 'airguard', 'airguard', 'mujhe',
  'apna', 'apne', 'apni', 'hamara', 'hamare', 'yahan', 'yahaan', 'wahan', 'vahan'
])

function safeStorageRead() {
  try {
    const raw = window.localStorage.getItem('selectedAirGuardLocation')
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    return null
  }
}

function normalizeToPlainText(value) {
  return String(value || '')
    .replace(/[^a-zA-Z0-9\s\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildKnownLocations() {
  const selected = safeStorageRead()
  const list = []

  if (selected && selected.name) {
    list.push({
      id: selected.id || 'selected-location',
      name: selected.name,
      region: selected.region || selected.country || 'Current area',
    })
  }

  return list
}

async function resolveLocationFromQuery(query, fallback = DEFAULT_FALLBACK_LOCATION) {
  const plainQuery = normalizeToPlainText(query).toLowerCase()

  if (!plainQuery) {
    return fallback
  }

  if (/home|my area|my location|mere area|mere home|apna area|mera area/i.test(query)) {
    const selected = safeStorageRead()
    if (selected?.name) {
      return selected
    }
  }

  const knownLocations = buildKnownLocations()

  for (const location of knownLocations) {
    const name = String(location.name || '').toLowerCase()
    if (plainQuery.includes(name) || name.includes(plainQuery)) {
      return location
    }
  }

  const tokens = plainQuery.split(/\s+/).filter((word) => word.length > 2 && !STOP_WORDS.has(word))
  const candidate = tokens.join(' ')

  if (!candidate) {
    return fallback
  }

  try {
    const results = await searchLocation(candidate)
    if (results && results.length > 0) {
      return results[0]
    }
  } catch (error) {
    console.warn('Location resolution warning:', error)
  }

  return fallback
}

async function fetchAqiForLocation(location) {
  const loc = location || DEFAULT_FALLBACK_LOCATION

  if (typeof loc.latitude !== 'undefined' && typeof loc.longitude !== 'undefined') {
    const aqiResponse = await getAirQuality(Number(loc.latitude), Number(loc.longitude))
    return {
      ...loc,
      aqi: aqiResponse.aqi,
      time: aqiResponse.time,
    }
  }

  const searchResults = await searchLocation(loc.name || 'Bhopal')

  if (!searchResults || searchResults.length === 0) {
    return {
      ...loc,
      aqi: null,
      time: 'Current',
    }
  }

  const match = searchResults[0]
  const aqiResponse = await getAirQuality(Number(match.latitude), Number(match.longitude))

  return {
    ...match,
    aqi: aqiResponse.aqi,
    time: aqiResponse.time,
  }
}

function getRiskSummary(aqi) {
  const band = getAqiBand(Number(aqi) || 0)

  if (band.label === 'Good') {
    return 'Air quality is good right now. Conditions are comfortable for most outdoor activities.'
  }

  if (band.label === 'Moderate') {
    return 'Air quality is moderate. Sensitive people should limit prolonged outdoor exposure.'
  }

  if (band.label === 'Unhealthy for Sensitive Groups') {
    return 'Air quality is a bit risky for sensitive groups. Consider reducing exertion and longer outdoor time.'
  }

  if (band.label === 'Unhealthy') {
    return 'Air quality is unhealthy. Limit prolonged outdoor activities and stay indoors when possible.'
  }

  return 'Air quality is hazardous. Avoid prolonged outdoor exposure and take extra care.'
}

function getActivityAdvice(aqi) {
  const value = Number(aqi) || 0

  if (value <= 50) {
    return 'You can usually go jogging or outdoor exercise comfortably.'
  }

  if (value <= 100) {
    return 'You can exercise, but keep sessions moderate and keep an eye on how you feel.'
  }

  if (value <= 150) {
    return 'Consider shorter or lighter outdoor activity, especially if you are sensitive to pollution.'
  }

  return 'It is better to avoid intense outdoor activity right now, especially jogging or long workouts.'
}

function getAlertSummaryForLocation(locationName, aqi) {
  const band = getAqiBand(Number(aqi) || 0)
  return `${locationName} currently has AQI ${aqi}. ${band.label} air quality. ${getRiskSummary(aqi)}`
}

export async function runVoiceCommand(rawText, { language = 'en-IN' } = {}) {
  const text = String(rawText || '').trim()

  if (!text) {
    return {
      response: 'Please say a clear question or location.',
      spokenText: 'Please say a clear question or location.',
      type: 'empty',
    }
  }

  const lowerText = text.toLowerCase()
  const fallbackLocation = safeStorageRead()

  try {
    if (/alert|alerts|status|warning/.test(lowerText)) {
      const resolved = await resolveLocationFromQuery(text, fallbackLocation)
      const aqiData = await fetchAqiForLocation(resolved)
      const locationName = resolved?.name || fallbackLocation.name
      const response = getAlertSummaryForLocation(locationName, aqiData.aqi)

      return {
        response,
        spokenText: response,
        type: 'alert',
        location: locationName,
        aqi: aqiData.aqi,
        language,
      }
    }

    if (/jog|running|cycling|walking|sports|exercise|outdoor|activity/.test(lowerText) && /can i|can i go|kya main|kya mein|should i|should i go|kar sakta|kar sakti|ja sakta|ja sakti/.test(lowerText)) {
      const resolved = await resolveLocationFromQuery(text, fallbackLocation)
      const aqiData = await fetchAqiForLocation(resolved)
      const locationName = resolved?.name || fallbackLocation.name
      const response = `${locationName} AQI is ${aqiData.aqi}. ${getActivityAdvice(aqiData.aqi)}`

      return {
        response,
        spokenText: response,
        type: 'activity',
        location: locationName,
        aqi: aqiData.aqi,
        language,
      }
    }

    const resolved = await resolveLocationFromQuery(text, fallbackLocation)
    const aqiData = await fetchAqiForLocation(resolved)
    const locationName = resolved?.name || fallbackLocation.name

    if (/air quality|aqi|pollution|smoke|quality/.test(lowerText) || /batao|bata|kaise|haina|hai/.test(lowerText)) {
      const response = `${locationName} current AQI is ${aqiData.aqi}. ${getRiskSummary(aqiData.aqi)}`

      return {
        response,
        spokenText: response,
        type: 'aqi',
        location: locationName,
        aqi: aqiData.aqi,
        language,
      }
    }

    const response = `${locationName} current AQI is ${aqiData.aqi}. ${getRiskSummary(aqiData.aqi)}`

    return {
      response,
      spokenText: response,
      type: 'general',
      location: locationName,
      aqi: aqiData.aqi,
      language,
    }
  } catch (error) {
    console.error('Voice command processing failed:', error)
    return {
      response: 'I could not fetch the current air quality data for that location. Please try again.',
      spokenText: 'I could not fetch the current air quality data for that location. Please try again.',
      type: 'error',
      language,
    }
  }
}
