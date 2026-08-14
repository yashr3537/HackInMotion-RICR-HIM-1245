import { getAirQuality, getWeather } from '../data/airQualityApi'
import { searchLocation, reverseGeocode } from '../data/locationApi'
import {
  getAqiCategory,
  getPersonalizedGuidance,
  getActivityRecommendations,
} from '../utils/riskEngine/riskEngine'
import { loadUserSavedLocations } from '../data/savedLocationsStore'

// Helper to remove punctuation and extra spaces
function cleanText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[?,!.;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Stop words in Hindi/Hinglish/English to ignore during location extraction
const STOP_WORDS = new Set([
  'ka', 'ki', 'ke', 'ko', 'me', 'mein', 'par', 'se', 'hai', 'hain', 'kaisa', 'kaisi', 'kaisa',
  'kya', 'aur', 'and', 'or', 'in', 'at', 'of', 'for', 'the', 'is', 'are', 'what', 'how', 'show',
  'tell', 'get', 'check', 'batao', 'bataiye', 'dekho', 'status', 'aqi', 'air', 'quality',
  'weather', 'mausam', 'temp', 'temperature', 'humidity', 'wind', 'pollution', 'risk',
  'running', 'cycling', 'walking', 'walk', 'run', 'sports', 'safe', 'outdoor', 'activity',
  'mere', 'meri', 'mera', 'my', 'area', 'current', 'location', 'place', 'places', 'saved',
  'compare', 'vs', 'versus', 'karo'
])

/**
 * Extract location names from text
 */
function extractLocationCandidates(query) {
  const cleaned = cleanText(query)

  // Pattern: "<Location> ka/ki/ke/in/at AQI/weather/mausam"
  const patterns = [
    /([a-zA-Z\s]+?)\s+(?:ka|ki|ke|in|at|around|near)\s+(?:aqi|weather|mausam|air|quality|pollution|status|temperature)/i,
    /(?:aqi|weather|mausam|air quality|pollution|status|temperature)\s+(?:of|in|at|for|ka|ki|ke)\s+([a-zA-Z\s]+)/i,
    /compare\s+([a-zA-Z\s]+)\s+(?:aur|and|vs|versus|with)\s+([a-zA-Z\s]+)/i,
    /([a-zA-Z\s]+)\s+(?:aur|and|vs|versus)\s+([a-zA-Z\s]+)\s+compare/i,
  ]

  for (const pattern of patterns) {
    const match = query.match(pattern)
    if (match) {
      if (match[2]) {
        // Two locations
        return [match[1].trim(), match[2].trim()]
      }
      const candidate = match[1].trim()
      const filtered = candidate.split(' ').filter(w => !STOP_WORDS.has(w.toLowerCase())).join(' ')
      if (filtered.length >= 2) return [filtered]
    }
  }

  // Fallback word parsing
  const words = cleaned.split(' ')
  const candidates = words.filter(w => !STOP_WORDS.has(w) && w.length >= 3)
  return candidates
}

/**
 * Gets user's current device geolocation or default
 */
async function getCurrentUserLocation() {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return { latitude: 23.2599, longitude: 77.4126, name: 'Bhopal', region: 'Madhya Pradesh' }
  }

  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 4000,
        maximumAge: 300000,
      })
    })
    const lat = pos.coords.latitude
    const lon = pos.coords.longitude
    const geo = await reverseGeocode(lat, lon)
    return {
      latitude: lat,
      longitude: lon,
      name: geo.name || 'Current Location',
      region: geo.region || '',
    }
  } catch (e) {
    return { latitude: 23.2599, longitude: 77.4126, name: 'Bhopal', region: 'Madhya Pradesh' }
  }
}

/**
 * Voice Assistant Intent Processor
 * Reuses existing APIs and data layer exclusively.
 */
export async function processVoiceAssistantQuery(userQuery, context = {}, userId = null) {
  const query = cleanText(userQuery)

  if (!query) {
    return {
      text: "Please ask or speak a question about air quality, weather, outdoor safety, or saved locations.",
      context,
      understood: true,
    }
  }

  // Check 1: SAVED LOCATIONS STATUS
  // e.g. "meri saved locations ka status kya hai?", "my saved places", "saved locations"
  if (query.includes('saved location') || query.includes('saved places') || (query.includes('saved') && query.includes('status'))) {
    const saved = loadUserSavedLocations(userId)
    if (!saved || saved.length === 0) {
      return {
        text: "Aapki koi saved location nahi hai. Quick tracking ke liye Dashboard par locations save kar sakte hain.",
        context,
        understood: true,
      }
    }

    const statuses = await Promise.all(
      saved.slice(0, 3).map(async (loc) => {
        try {
          const aq = await getAirQuality(loc.latitude, loc.longitude)
          const cat = getAqiCategory(aq.aqi)
          return `${loc.name}: AQI ${aq.aqi || 'N/A'} (${cat.label})`
        } catch (e) {
          return `${loc.name}: Data unavailable`
        }
      })
    )

    return {
      text: `Aapki saved locations ka status: ${statuses.join('. ')}.`,
      context,
      understood: true,
    }
  }

  // Check 2: COMPARE LOCATIONS
  // e.g. "Delhi aur Bhopal compare karo", "Compare Delhi and Bhopal"
  if (query.includes('compare') || (query.includes('aur') && (query.includes('aqi') || query.includes('hawa')))) {
    const candidates = extractLocationCandidates(userQuery)
    if (candidates.length >= 2) {
      const [name1, name2] = candidates
      const [res1, res2] = await Promise.all([
        searchLocation(name1).then(r => r[0]),
        searchLocation(name2).then(r => r[0]),
      ])

      if (res1 && res2) {
        const [aq1, aq2] = await Promise.all([
          getAirQuality(res1.latitude, res1.longitude),
          getAirQuality(res2.latitude, res2.longitude),
        ])

        const cat1 = getAqiCategory(aq1.aqi)
        const cat2 = getAqiCategory(aq2.aqi)

        const better = aq1.aqi <= aq2.aqi ? res1.name : res2.name

        const text = `${res1.name} ka AQI ${aq1.aqi} (${cat1.label}) hai aur ${res2.name} ka AQI ${aq2.aqi} (${cat2.label}) hai. ${better} me hawa behtar hai.`
        
        const nextContext = {
          ...context,
          lastLocation: { name: res1.name, lat: res1.latitude, lon: res1.longitude, aqi: aq1.aqi },
        }

        return { text, context: nextContext, understood: true }
      }
    }
  }

  // Check 3: OUTDOOR ACTIVITY SAFETY
  // e.g. "Aaj outdoor running safe hai?", "Is running safe?", "Walking safe hai?"
  const isActivityQuery = query.includes('running') || query.includes('run') || query.includes('cycling') ||
    query.includes('walking') || query.includes('walk') || query.includes('sports') ||
    query.includes('safe') || query.includes('outdoors') || query.includes('outdoor')

  if (isActivityQuery) {
    let locName = ''
    let lat, lon, aqiValue

    // Check if user specified location in the same query (e.g. "Is running safe in Betul?")
    const candidates = extractLocationCandidates(userQuery)
    let foundLoc = null
    if (candidates.length > 0) {
      const searchRes = await searchLocation(candidates[0])
      if (searchRes && searchRes.length > 0) {
        foundLoc = searchRes[0]
      }
    }

    if (foundLoc) {
      locName = foundLoc.name
      lat = foundLoc.latitude
      lon = foundLoc.longitude
      const aq = await getAirQuality(lat, lon)
      aqiValue = aq.aqi
    } else if (context.lastLocation) {
      // Use previous conversation context!
      locName = context.lastLocation.name
      lat = context.lastLocation.lat
      lon = context.lastLocation.lon
      aqiValue = context.lastLocation.aqi
      if (aqiValue == null) {
        const aq = await getAirQuality(lat, lon)
        aqiValue = aq.aqi
      }
    } else {
      // Use current user geolocation
      const currentLoc = await getCurrentUserLocation()
      locName = currentLoc.name
      lat = currentLoc.latitude
      lon = currentLoc.longitude
      const aq = await getAirQuality(lat, lon)
      aqiValue = aq.aqi
    }

    const cat = getAqiCategory(aqiValue)
    const recs = getActivityRecommendations(aqiValue)
    const runningRec = recs.running || {}
    const guidance = getPersonalizedGuidance(aqiValue)

    const text = `${locName} me AQI ${aqiValue} (${cat.label}) hai. Outdoor activity recommendation: ${runningRec.verdict || guidance.verdict}. ${runningRec.reason || guidance.detail}`

    const nextContext = {
      ...context,
      lastLocation: { name: locName, lat, lon, aqi: aqiValue },
    }

    return { text, context: nextContext, understood: true }
  }

  // Check 4: WEATHER QUERY
  // e.g. "Betul ka weather?", "Bhopal ka mausam?"
  const isWeatherQuery = query.includes('weather') || query.includes('mausam') || query.includes('temperature') || query.includes('temp')
  if (isWeatherQuery) {
    let targetLoc = null
    const candidates = extractLocationCandidates(userQuery)

    if (candidates.length > 0) {
      const searchRes = await searchLocation(candidates[0])
      if (searchRes && searchRes.length > 0) {
        targetLoc = searchRes[0]
      }
    }

    if (!targetLoc && context.lastLocation) {
      targetLoc = { name: context.lastLocation.name, latitude: context.lastLocation.lat, longitude: context.lastLocation.lon }
    }

    if (!targetLoc) {
      targetLoc = await getCurrentUserLocation()
    }

    const weatherData = await getWeather(targetLoc.latitude, targetLoc.longitude)

    if (!weatherData) {
      return {
        text: `${targetLoc.name} ka weather data filhaal available nahi hai.`,
        context,
        understood: true,
      }
    }

    const text = `${targetLoc.name} me abhi temperature ${weatherData.temperature !== null ? weatherData.temperature + '°C' : 'N/A'} hai, humidity ${weatherData.humidity !== null ? weatherData.humidity + '%' : 'N/A'}, aur wind speed ${weatherData.windSpeed !== null ? weatherData.windSpeed + ' km/h' : 'N/A'} hai.`

    const nextContext = {
      ...context,
      lastLocation: { name: targetLoc.name, lat: targetLoc.latitude, lon: targetLoc.longitude },
    }

    return { text, context: nextContext, understood: true }
  }

  // Check 5: CURRENT AREA / MERE AREA AQI
  // e.g. "Mere area ki air quality?", "Current area AQI", "Mera AQI"
  const isCurrentAreaQuery = query.includes('mere area') || query.includes('my area') || query.includes('current location') || query.includes('yahan ka') || query.includes('here')
  if (isCurrentAreaQuery) {
    const currentLoc = await getCurrentUserLocation()
    const aq = await getAirQuality(currentLoc.latitude, currentLoc.longitude)
    const cat = getAqiCategory(aq.aqi)
    const guidance = getPersonalizedGuidance(aq.aqi)

    const text = `${currentLoc.name} ka current AQI ${aq.aqi} hai. Air quality ${cat.label} category me hai. ${guidance.headline} ${guidance.detail}`

    const nextContext = {
      ...context,
      lastLocation: { name: currentLoc.name, lat: currentLoc.latitude, lon: currentLoc.longitude, aqi: aq.aqi },
    }

    return { text, context: nextContext, understood: true }
  }

  // Check 6: GENERAL SPECIFIC LOCATION AQI
  // e.g. "Betul ka AQI?", "Bhopal ka AQI?", "What is the AQI in Betul?"
  const candidates = extractLocationCandidates(userQuery)
  let searchRes = []

  if (candidates.length > 0) {
    for (const cand of candidates) {
      const res = await searchLocation(cand)
      if (res && res.length > 0) {
        searchRes = res
        break
      }
    }
  }

  if (searchRes.length > 0) {
    const loc = searchRes[0]
    const aq = await getAirQuality(loc.latitude, loc.longitude)
    const cat = getAqiCategory(aq.aqi)

    let advice = ''
    if (aq.aqi <= 50) {
      advice = 'Air quality Good category me hai. Health risk zero hai.'
    } else if (aq.aqi <= 100) {
      advice = 'Air quality Moderate category me hai. Sensitive users ko prolonged outdoor activity limit karni chahiye.'
    } else if (aq.aqi <= 150) {
      advice = 'Air quality Unhealthy for Sensitive Groups hai. Outdoor stay kam karein.'
    } else {
      advice = 'Air quality Unhealthy/Hazardous category me hai. Outdoor exertion strictly avoid karein.'
    }

    const text = `${loc.name} ka current AQI ${aq.aqi} hai. ${advice}`

    const nextContext = {
      ...context,
      lastLocation: { name: loc.name, lat: loc.latitude, lon: loc.longitude, aqi: aq.aqi },
    }

    return { text, context: nextContext, understood: true }
  }

  // Fallback for context-based location query e.g. "AQI kitna hai?" when location was previously selected
  if ((query.includes('aqi') || query.includes('hawa')) && context.lastLocation) {
    const loc = context.lastLocation
    const aq = await getAirQuality(loc.lat, loc.lon)
    const cat = getAqiCategory(aq.aqi)
    const text = `${loc.name} ka current AQI ${aq.aqi} (${cat.label}) hai.`
    return { text, context, understood: true }
  }

  // UNKNOWN / UNUNDERSTOOD QUERY
  // Requirement #5: Do NOT invent an answer! Show exact fallback message.
  return {
    text: "I didn't understand that request. Please try asking about AQI, weather, pollution, risk, saved locations, or outdoor activity.",
    context,
    understood: false,
  }
}
