import { getAirQuality, getWeather } from './airQuality/airQualityApi'
import { searchLocation, reverseGeocode } from './location/locationApi'
import {
  getAqiCategory,
  getPersonalizedGuidance,
  getActivityRecommendations,
} from '../utils/riskEngine/riskEngine'
import { fetchSavedLocations } from './supabase/supabaseService'

// Helper to remove punctuation and extra spaces
function cleanText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[?,!.;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Stop words across English, Hindi, Hinglish, Spanish, French
const STOP_WORDS = new Set([
  'ka',
  'ki',
  'ke',
  'ko',
  'me',
  'mein',
  'par',
  'se',
  'hai',
  'hain',
  'kaisa',
  'kaisi',
  'kya',
  'aur',
  'and',
  'or',
  'in',
  'at',
  'of',
  'for',
  'the',
  'is',
  'are',
  'what',
  'how',
  'show',
  'tell',
  'get',
  'check',
  'batao',
  'bataiye',
  'dekho',
  'status',
  'aqi',
  'air',
  'quality',
  'weather',
  'mausam',
  'temp',
  'temperature',
  'humidity',
  'wind',
  'pollution',
  'risk',
  'running',
  'cycling',
  'walking',
  'walk',
  'run',
  'sports',
  'safe',
  'outdoor',
  'activity',
  'mere',
  'meri',
  'mera',
  'my',
  'area',
  'current',
  'location',
  'place',
  'places',
  'saved',
  'compare',
  'vs',
  'versus',
  'karo',
  'el',
  'la',
  'los',
  'las',
  'de',
  'del',
  'en',
  'que',
  'le',
  'les',
  'du',
  'des',
  'est',
])

function extractLocationCandidates(query) {
  const cleaned = cleanText(query)

  const patterns = [
    /([a-zA-Z\s]+?)\s+(?:ka|ki|ke|in|at|around|near|de|en)\s+(?:aqi|weather|mausam|air|quality|pollution|status|temperature|clima)/i,
    /(?:aqi|weather|mausam|air quality|pollution|status|temperature|clima)\s+(?:of|in|at|for|ka|ki|ke|de|en)\s+([a-zA-Z\s]+)/i,
    /compare\s+([a-zA-Z\s]+)\s+(?:aur|and|vs|versus|with|y|et)\s+([a-zA-Z\s]+)/i,
    /([a-zA-Z\s]+)\s+(?:aur|and|vs|versus|y|et)\s+([a-zA-Z\s]+)\s+(?:compare|comparar|comparer)/i,
  ]

  for (const pattern of patterns) {
    const match = query.match(pattern)
    if (match) {
      if (match[2]) {
        return [match[1].trim(), match[2].trim()]
      }
      const candidate = match[1].trim()
      const filtered = candidate
        .split(' ')
        .filter((w) => !STOP_WORDS.has(w.toLowerCase()))
        .join(' ')
      if (filtered.length >= 2) return [filtered]
    }
  }

  const words = cleaned.split(' ')
  const candidates = words.filter((w) => !STOP_WORDS.has(w) && w.length >= 3)
  return candidates
}

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

// Fallback messages for unknown queries per language
const UNKNOWN_FALLBACKS = {
  hi: 'मुझे वह अनुरोध समझ नहीं आया। कृपया AQI, मौसम, प्रदूषण, जोखिम, सहेजी गई लोकेशन, या बाहरी गतिविधियों के बारे में पूछें।',
  mr: 'मला ती विनंती समजली नाही. कृपया AQI, हवामान, प्रदूषण, धोका, जतन केलेली ठिकाणे किंवा मैदानी क्रियाकलापांबद्दल विचारून पहा.',
  bn: 'আমি সেই অনুরোধটি বুঝতে পারিনি। দয়া করে AQI, আবহাওয়া, দূষণ, ঝুঁকি, সংরক্ষিত স্থান বা আউটডোর কার্যক্রম সম্পর্কে জিজ্ঞাসা করার চেষ্টা করুন।',
  ta: 'எனக்கு அந்த கோரிக்கை புரியவில்லை. தயவுசெய்து AQI, வானிலை, மாசுபாடு, அபாயம், சேமிக்கப்பட்ட இடங்கள் அல்லது வெளிப்புற நடவடிக்கைகள் பற்றி கேட்கவும்.',
  te: 'నాకు ఆ అభ్యర్థన అర్థం కాలేదు. దయచేసి AQI, వాతావరణం, కాలుష్యం, ప్రమాదం, సేవ్ చేసిన ప్రదేశాలు లేదా అవుట్‌డోర్ కార్యకలాపాల గురించి అడగండి.',
  gu: 'મને તે વિનંતી સમજાઈ નથી. કૃપા કરીને AQI, હવામાન, પ્રદૂષણ, જોખમ, સાચવેલ સ્થાનો અથવા આઉટડોર પ્રવૃત્તિઓ વિશે પૂછવાનો પ્રયાસ કરો.',
  kn: 'ನನಗೆ ಆ ವಿನಂತಿ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು AQI, ಹವಾಮಾನ, ಮಾಲಿನ್ಯ, ಅಪಾಯ, ಉಳಿಸಿದ ಸ್ಥಳಗಳು ಅಥವಾ ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳ ಬಗ್ಗೆ ಕೇಳಲು ಪ್ರಯತ್ನಿಸಿ.',
  ml: 'എനിക്ക് ആ അഭ്യർത്ഥന മനസ്സിലായില്ല. AQI, കാലാവസ്ഥ, മലിനീകരണം, അപകടസാധ്യത, സംരക്ഷിച്ച ലൊക്കേഷനുകൾ അല്ലെങ്കിൽ ഔട്ട്ഡോർ പ്രവർത്തനങ്ങൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കാൻ ശ്രമിക്കുക.',
  pa: 'ਮੈਨੂੰ ਉਹ ਬੇਨਤੀ ਸਮਝ ਨਹੀਂ ਆਈ। ਕਿਰਪਾ ਕਰਕੇ AQI, ਮੌਸਮ, ਪ੍ਰਦੂਸ਼ਣ, ਜੋਖਮ, ਸੰਭਾਲੀਆਂ ਥਾਵਾਂ ਜਾਂ ਬਾਹਰੀ ਗਤੀਵਿਧੀਆਂ ਬਾਰੇ ਪੁੱਛਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  ur: 'مجھے وہ درخواست سمجھ نہیں آئی۔ برائے مہربانی AQI، موسم، آلودگی، خطرہ، محفوظ کردہ مقامات، یا بیرونی سرگرمیوں کے بارے میں پوچھیں۔',
  es: 'No entendí esa solicitud. Por favor intente preguntar sobre el AQI, clima, contaminación, riesgo, ubicaciones guardadas o actividades al aire libre.',
  fr: "Je n'ai pas compris cette demande. Veuillez essayer de poser des questions sur l'IQA, la météo, la pollution, les risques, les lieux enregistrés ou les activités de plein air.",
  en: "I didn't understand that request. Please try asking about AQI, weather, pollution, risk, saved locations, or outdoor activity.",
}

/**
 * Voice Assistant Intent Processor
 * Accepts user language and synchronizes output language dynamically.
 */
export async function processVoiceAssistantQuery(
  userQuery,
  context = {},
  userId = null,
  lang = 'en'
) {
  const query = cleanText(userQuery)
  const currentLang = String(lang || 'en')
    .toLowerCase()
    .split('-')[0]

  if (!query) {
    return {
      text:
        currentLang === 'hi'
          ? 'कृपया वायु गुणवत्ता, मौसम, या सुरक्षा के बारे में प्रश्न पूछें या बोलें।'
          : currentLang === 'es'
            ? 'Por favor haga una pregunta sobre la calidad del aire o el clima.'
            : currentLang === 'fr'
              ? "Veuillez poser une question sur la qualité de l'air ou la météo."
              : 'Please ask or speak a question about air quality, weather, outdoor safety, or saved locations.',
      context,
      understood: true,
    }
  }

  // Check 1: SAVED LOCATIONS STATUS
  if (
    query.includes('saved location') ||
    query.includes('saved places') ||
    query.includes('saved') ||
    query.includes('lugares guardados') ||
    query.includes('lieux enregistrés')
  ) {
    const saved = await fetchSavedLocations(userId)
    if (!saved || saved.length === 0) {
      const emptyMsg =
        currentLang === 'hi'
          ? 'आपकी कोई सहेजी गई लोकेशन नहीं है। क्विक ट्रैकिंग के लिए आप डैशबोर्ड पर लोकेशन सेव कर सकते हैं।'
          : currentLang === 'es'
            ? 'No tienes ubicaciones guardadas.'
            : currentLang === 'fr'
              ? "Vous n'avez aucun lieu enregistré."
              : 'You have no saved locations. You can save locations from the Dashboard.'

      return { text: emptyMsg, context, understood: true }
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

    const prefix =
      currentLang === 'hi'
        ? 'आपकी सहेजी गई लोकेशन का स्टेटस'
        : currentLang === 'es'
          ? 'Estado de tus ubicaciones guardadas'
          : currentLang === 'fr'
            ? 'Statut de vos lieux enregistrés'
            : 'Your saved locations status'

    return {
      text: `${prefix}: ${statuses.join('. ')}.`,
      context,
      understood: true,
    }
  }

  // Check 2: COMPARE LOCATIONS
  if (
    query.includes('compare') ||
    query.includes('comparar') ||
    query.includes('comparer') ||
    (query.includes('aur') && (query.includes('aqi') || query.includes('hawa')))
  ) {
    const candidates = extractLocationCandidates(userQuery)
    if (candidates.length >= 2) {
      const [name1, name2] = candidates
      const [res1, res2] = await Promise.all([
        searchLocation(name1).then((r) => r[0]),
        searchLocation(name2).then((r) => r[0]),
      ])

      if (res1 && res2) {
        const [aq1, aq2] = await Promise.all([
          getAirQuality(res1.latitude, res1.longitude),
          getAirQuality(res2.latitude, res2.longitude),
        ])

        const cat1 = getAqiCategory(aq1.aqi)
        const cat2 = getAqiCategory(aq2.aqi)
        const better = aq1.aqi <= aq2.aqi ? res1.name : res2.name

        let text = ''
        if (currentLang === 'hi') {
          text = `${res1.name} का AQI ${aq1.aqi} (${cat1.label}) और ${res2.name} का AQI ${aq2.aqi} (${cat2.label}) है। ${better} में हवा बेहतर है।`
        } else if (currentLang === 'es') {
          text = `El AQI en ${res1.name} es ${aq1.aqi} (${cat1.label}) y en ${res2.name} es ${aq2.aqi} (${cat2.label}). El aire es mejor en ${better}.`
        } else if (currentLang === 'fr') {
          text = `L'IQA à ${res1.name} est de ${aq1.aqi} (${cat1.label}) et à ${res2.name} est de ${aq2.aqi} (${cat2.label}). L'air est meilleur à ${better}.`
        } else {
          text = `${res1.name}'s AQI is ${aq1.aqi} (${cat1.label}) and ${res2.name}'s AQI is ${aq2.aqi} (${cat2.label}). Air quality is better in ${better}.`
        }

        const nextContext = {
          ...context,
          lastLocation: { name: res1.name, lat: res1.latitude, lon: res1.longitude, aqi: aq1.aqi },
        }

        return { text, context: nextContext, understood: true }
      }
    }
  }

  // Check 3: OUTDOOR ACTIVITY SAFETY
  const isActivityQuery =
    query.includes('running') ||
    query.includes('run') ||
    query.includes('cycling') ||
    query.includes('walking') ||
    query.includes('walk') ||
    query.includes('sports') ||
    query.includes('safe') ||
    query.includes('outdoors') ||
    query.includes('outdoor') ||
    query.includes('correr') ||
    query.includes('courir')

  if (isActivityQuery) {
    let locName = ''
    let lat, lon, aqiValue

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
      locName = context.lastLocation.name
      lat = context.lastLocation.lat
      lon = context.lastLocation.lon
      aqiValue = context.lastLocation.aqi
      if (aqiValue == null) {
        const aq = await getAirQuality(lat, lon)
        aqiValue = aq.aqi
      }
    } else {
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

    let text = ''
    if (currentLang === 'hi') {
      text = `${locName} में AQI ${aqiValue} (${cat.label}) है। आउटडोर गतिविधि सलाह: ${runningRec.verdict || guidance.verdict}। ${runningRec.reason || guidance.detail}`
    } else if (currentLang === 'es') {
      text = `El AQI en ${locName} es ${aqiValue} (${cat.label}). Recomendación para actividades al aire libre: ${runningRec.verdict || guidance.verdict}. ${runningRec.reason || guidance.detail}`
    } else if (currentLang === 'fr') {
      text = `L'IQA à ${locName} est de ${aqiValue} (${cat.label}). Recommandation d'activité extérieure : ${runningRec.verdict || guidance.verdict}. ${runningRec.reason || guidance.detail}`
    } else {
      text = `${locName}'s AQI is ${aqiValue} (${cat.label}). Outdoor activity recommendation: ${runningRec.verdict || guidance.verdict}. ${runningRec.reason || guidance.detail}`
    }

    const nextContext = {
      ...context,
      lastLocation: { name: locName, lat, lon, aqi: aqiValue },
    }

    return { text, context: nextContext, understood: true }
  }

  // Check 4: WEATHER QUERY
  const isWeatherQuery =
    query.includes('weather') ||
    query.includes('mausam') ||
    query.includes('temperature') ||
    query.includes('temp') ||
    query.includes('clima') ||
    query.includes('météo')
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
      targetLoc = {
        name: context.lastLocation.name,
        latitude: context.lastLocation.lat,
        longitude: context.lastLocation.lon,
      }
    }

    if (!targetLoc) {
      targetLoc = await getCurrentUserLocation()
    }

    const weatherData = await getWeather(targetLoc.latitude, targetLoc.longitude)

    if (!weatherData) {
      return {
        text: `${targetLoc.name} weather data unavailable.`,
        context,
        understood: true,
      }
    }

    const tempStr = weatherData.temperature !== null ? weatherData.temperature + '°C' : 'N/A'
    const humStr = weatherData.humidity !== null ? weatherData.humidity + '%' : 'N/A'
    const windStr = weatherData.windSpeed !== null ? weatherData.windSpeed + ' km/h' : 'N/A'

    let text = ''
    if (currentLang === 'hi') {
      text = `${targetLoc.name} में वर्तमान तापमान ${tempStr}, आर्द्रता ${humStr}, और हवा की गति ${windStr} है।`
    } else if (currentLang === 'es') {
      text = `En ${targetLoc.name} la temperatura actual es de ${tempStr}, humedad del ${humStr} y velocidad del viento de ${windStr}.`
    } else if (currentLang === 'fr') {
      text = `À ${targetLoc.name}, la température actuelle est de ${tempStr}, l'humidité de ${humStr} et la vitesse du vent de ${windStr}.`
    } else {
      text = `${targetLoc.name}'s current temperature is ${tempStr}, humidity ${humStr}, and wind speed ${windStr}.`
    }

    const nextContext = {
      ...context,
      lastLocation: { name: targetLoc.name, lat: targetLoc.latitude, lon: targetLoc.longitude },
    }

    return { text, context: nextContext, understood: true }
  }

  // Check 5: CURRENT AREA / MERE AREA AQI
  const isCurrentAreaQuery =
    query.includes('mere area') ||
    query.includes('my area') ||
    query.includes('current location') ||
    query.includes('yahan ka') ||
    query.includes('mi área') ||
    query.includes('ma zone')
  if (isCurrentAreaQuery) {
    const currentLoc = await getCurrentUserLocation()
    const aq = await getAirQuality(currentLoc.latitude, currentLoc.longitude)
    const cat = getAqiCategory(aq.aqi)
    const guidance = getPersonalizedGuidance(aq.aqi)

    let text = ''
    if (currentLang === 'hi') {
      text = `${currentLoc.name} का वर्तमान AQI ${aq.aqi} है। वायु गुणवत्ता ${cat.label} श्रेणी में है। ${guidance.headline} ${guidance.detail}`
    } else if (currentLang === 'es') {
      text = `El AQI actual en ${currentLoc.name} es ${aq.aqi}. La calidad del aire está en categoría ${cat.label}.`
    } else if (currentLang === 'fr') {
      text = `L'IQA actuel à ${currentLoc.name} est de ${aq.aqi}. La qualité de l'air est dans la catégorie ${cat.label}.`
    } else {
      text = `${currentLoc.name}'s current AQI is ${aq.aqi}. Air quality is in ${cat.label} category. ${guidance.headline} ${guidance.detail}`
    }

    const nextContext = {
      ...context,
      lastLocation: {
        name: currentLoc.name,
        lat: currentLoc.latitude,
        lon: currentLoc.longitude,
        aqi: aq.aqi,
      },
    }

    return { text, context: nextContext, understood: true }
  }

  // Check 6: GENERAL SPECIFIC LOCATION AQI
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
    if (currentLang === 'hi') {
      advice =
        aq.aqi <= 50
          ? 'वायु गुणवत्ता अच्छी है।'
          : aq.aqi <= 100
            ? 'वायु गुणवत्ता Moderate श्रेणी में है। संवेदनशील उपयोगकर्ता outdoor गतिविधि सीमित रखें।'
            : 'वायु गुणवत्ता खराब श्रेणी में है। बाहर रहने से बचें।'
    } else if (currentLang === 'es') {
      advice =
        aq.aqi <= 50
          ? 'La calidad del aire es buena.'
          : aq.aqi <= 100
            ? 'La calidad del aire es Moderada. Usuarios sensibles deben limitar actividad exterior.'
            : 'La calidad del aire es dañina. Evite actividades al aire libre.'
    } else if (currentLang === 'fr') {
      advice =
        aq.aqi <= 50
          ? "La qualité de l'air est bonne."
          : aq.aqi <= 100
            ? "La qualité de l'air est Modérée."
            : "La qualité de l'air est mauvaise. Évitez les activités extérieures."
    } else {
      advice =
        aq.aqi <= 50
          ? 'Air quality is Good.'
          : aq.aqi <= 100
            ? 'Air quality is in Moderate category. Sensitive users should limit prolonged outdoor activity.'
            : 'Air quality is Unhealthy. Avoid outdoor exertion.'
    }

    let text = ''
    if (currentLang === 'hi') {
      text = `${loc.name} का वर्तमान AQI ${aq.aqi} है। ${advice}`
    } else if (currentLang === 'es') {
      text = `El AQI actual en ${loc.name} es ${aq.aqi}. ${advice}`
    } else if (currentLang === 'fr') {
      text = `L'IQA actuel à ${loc.name} est de ${aq.aqi}. ${advice}`
    } else {
      text = `${loc.name}'s current AQI is ${aq.aqi}. ${advice}`
    }

    const nextContext = {
      ...context,
      lastLocation: { name: loc.name, lat: loc.latitude, lon: loc.longitude, aqi: aq.aqi },
    }

    return { text, context: nextContext, understood: true }
  }

  // Fallback for context-based location query
  if (
    (query.includes('aqi') || query.includes('hawa') || query.includes('air')) &&
    context.lastLocation
  ) {
    const loc = context.lastLocation
    const aq = await getAirQuality(loc.lat, loc.lon)
    const cat = getAqiCategory(aq.aqi)

    const text =
      currentLang === 'hi'
        ? `${loc.name} का वर्तमान AQI ${aq.aqi} (${cat.label}) है।`
        : currentLang === 'es'
          ? `El AQI actual de ${loc.name} es ${aq.aqi} (${cat.label}).`
          : currentLang === 'fr'
            ? `L'IQA actuel de ${loc.name} est ${aq.aqi} (${cat.label}).`
            : `${loc.name}'s current AQI is ${aq.aqi} (${cat.label}).`

    return { text, context, understood: true }
  }

  // UNKNOWN / UNUNDERSTOOD QUERY
  const fallback = UNKNOWN_FALLBACKS[currentLang] || UNKNOWN_FALLBACKS.en
  return {
    text: fallback,
    context,
    understood: false,
  }
}
