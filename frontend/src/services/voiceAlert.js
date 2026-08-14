// Voice alert service: robust browser SpeechSynthesis voice loading, language selection & sequential queueing
const DEFAULT_LANGUAGE = 'en-IN'

const LANGUAGE_OPTIONS = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'gu-IN', label: 'Gujarati' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'ml-IN', label: 'Malayalam' },
  { code: 'pa-IN', label: 'Punjabi' },
  { code: 'ur-IN', label: 'Urdu' },
]

const ALERT_MESSAGES = {
  'en-IN': {
    good: (location, aqi) => `Air quality update for ${location}. Current AQI is ${aqi}. Air quality is good.`,
    moderate: (location, aqi) => `Air quality alert for ${location}. Current AQI is ${aqi}. Air quality is moderate. Consider reducing prolonged outdoor exposure.`,
    unhealthy: (location, aqi) => `Air quality alert for ${location}. Current AQI is ${aqi}. Air quality is unhealthy. Consider limiting outdoor activity.`,
    hazardous: (location, aqi) => `Important air quality alert for ${location}. Current AQI is ${aqi}. Air quality is hazardous. Avoid prolonged outdoor exposure.`,
  },
  'hi-IN': {
    good: (location, aqi) => `${location} के लिए वायु गुणवत्ता अपडेट। वर्तमान AQI ${aqi} है। वायु गुणवत्ता अच्छी है।`,
    moderate: (location, aqi) => `${location} के लिए वायु गुणवत्ता चेतावनी। वर्तमान AQI ${aqi} है। वायु गुणवत्ता मध्यम है। लंबे समय तक बाहर रहने से बचें।`,
    unhealthy: (location, aqi) => `${location} के लिए वायु गुणवत्ता चेतावनी। वर्तमान AQI ${aqi} है। वायु गुणवत्ता अस्वास्थ्यकर है। बाहर की गतिविधियों को सीमित करने पर विचार करें।`,
    hazardous: (location, aqi) => `${location} के लिए महत्वपूर्ण वायु गुणवत्ता चेतावनी। वर्तमान AQI ${aqi} है। वायु गुणवत्ता बहुत खराब है। लंबे समय तक बाहर रहने से बचें।`,
  },
  'mr-IN': {
    good: (location, aqi) => `${location} साठी हवा गुणवत्ता अपडेट. सध्याचा AQI ${aqi} आहे. हवेची गुणवत्ता चांगली आहे.`,
    moderate: (location, aqi) => `${location} साठी हवा गुणवत्ता सूचना. सध्याचा AQI ${aqi} आहे. हवेची गुणवत्ता मध्यम आहे. जास्त वेळ बाहेर राहणे टाळा.`,
    unhealthy: (location, aqi) => `${location} साठी हवा गुणवत्ता सूचना. सध्याचा AQI ${aqi} आहे. हवेची गुणवत्ता अस्वास्थ्यकर आहे. बाहेरील क्रियाकलाप कमी करण्याचा विचार करा.`,
    hazardous: (location, aqi) => `${location} साठी महत्त्वाची हवा गुणवत्ता सूचना. सध्याचा AQI ${aqi} आहे. हवेची गुणवत्ता धोकादायक आहे. जास्त वेळ बाहेर राहणे टाळा.`,
  },
  'bn-IN': {
    good: (location, aqi) => `${location} এর বায়ু মানের আপডেট। বর্তমান AQI ${aqi}। বায়ুর মান ভালো।`,
    moderate: (location, aqi) => `${location} এর বায়ু মানের সতর্কতা। বর্তমান AQI ${aqi}। বায়ুর মান মাঝারি। দীর্ঘ সময় বাইরে থাকা কমিয়ে দিন।`,
    unhealthy: (location, aqi) => `${location} এর বায়ু মানের সতর্কতা। বর্তমান AQI ${aqi}। বায়ুর মান অস্বাস্থ্যকর। বাইরের কার্যকলাপ সীমিত করার কথা বিবেচনা করুন।`,
    hazardous: (location, aqi) => `${location} এর জন্য গুরুত্বপূর্ণ বায়ু মানের সতর্কতা। বর্তমান AQI ${aqi}। বায়ুর মান বিপজ্জনক। দীর্ঘ সময় বাইরে থাকা এড়িয়ে চলুন।`,
  },
  'ta-IN': {
    good: (location, aqi) => `${location} க்கான காற்றுத் தர புதுப்பிப்பு. தற்போதைய AQI ${aqi}. காற்றுத் தரம் நன்றாக உள்ளது.`,
    moderate: (location, aqi) => `${location} க்கான காற்றுத் தர எச்சரிக்கை. தற்போதைய AQI ${aqi}. காற்றுத் தரம் மிதமாக உள்ளது. நீண்ட நேரம் வெளியில் இருப்பதை குறைக்கவும்.`,
    unhealthy: (location, aqi) => `${location} க்கான காற்றுத் தர எச்சரிக்கை. தற்போதைய AQI ${aqi}. காற்றுத் தரம் ஆரோக்கியத்திற்கு கேடு விளைவிக்கலாம். வெளிப்புற செயல்பாடுகளை குறைக்கவும்.`,
    hazardous: (location, aqi) => `${location} க்கான முக்கிய காற்றுத் தர எச்சரிக்கை. தற்போதைய AQI ${aqi}. காற்றித் தரம் ஆபத்தானது. நீண்ட நேரம் வெளியில் இருப்பதை தவிர்க்கவும்.`,
  },
  'te-IN': {
    good: (location, aqi) => `${location} కోసం గాలి నాణ్యత అప్డేట్. ప్రస్తుత AQI ${aqi}. గాలి నాణ్యత మంచిగా ఉంది.`,
    moderate: (location, aqi) => `${location} కోసం గాలి నాణ్యత హెచ్చరిక. ప్రస్తుత AQI ${aqi}. గాలి నాణ్యత మితంగా ఉంది. ఎక్కువసేపు బయట ఉండటం తగ్గించండి.`,
    unhealthy: (location, aqi) => `${location} కోసం గాలి నాణ్యత హెచ్చరిక. ప్రస్తుత AQI ${aqi}. గాలి నాణ్యత అనారోగ్యకరంగా ఉంది. బహిరంగ కార్యకలాపాలను తగ్గించండి.`,
    hazardous: (location, aqi) => `${location} కోసం ముఖ్యమైన గాలి నాణ్యత హెచ్చరిక. ప్రస్తుత AQI ${aqi}. గాలి నాణ్యత ప్రమాదకరంగా ఉంది. ఎక్కువసేపు బయట ఉండకండి.`,
  },
  'gu-IN': {
    good: (location, aqi) => `${location} માટે હવાના ગુણવત્તા અપડેટ. વર્તમાન AQI ${aqi} છે. હવાની ગુણવત્તા સારી છે.`,
    moderate: (location, aqi) => `${location} માટે હવાની ગુણવત્તાની ચેતવણી. વર્તમાન AQI ${aqi} છે. હવાની ગુણવત્તા મધ્યમ છે. લાંબા સમય સુધી બહાર રહેતા રહેવાથી બચો.`,
    unhealthy: (location, aqi) => `${location} માટે હવાની ગુણવત્તાની ચેતવણી. વર્તમાન AQI ${aqi} છે. હવાની ગુણવત્તા અસ્વસ્થ છે. બહારની પ્રવૃત્તિઓ મર્યાદિત કરો.`,
    hazardous: (location, aqi) => `${location} માટે મહત્વપૂર્ણ હવાની ગુણવત્તાની ચેતવણી. વર્તમાન AQI ${aqi} છે. હવાની ગુણવત્તા જોખમી છે. લાંબા સમય સુધી બહાર રહેવાનું ટાળો.`,
  },
  'kn-IN': {
    good: (location, aqi) => `${location} ಗಾಗಿ ಗಾಳಿಯ ಗುಣಮಟ್ಟ ನವೀಕರಣ. ಪ್ರಸ್ತುತ AQI ${aqi}. ಗಾಳಿಮಟ್ಟ ಉತ್ತಮವಾಗಿದೆ.`,
    moderate: (location, aqi) => `${location} ಗಾಗಿ ಗಾಳಿಯ ಗುಣಮಟ್ಟ ಎಚ್ಚರಿಕೆ. ಪ್ರಸ್ತುತ AQI ${aqi}. ಗಾಳಿಮಟ್ಟ ಮಧ್ಯಮವಾಗಿದೆ. ಹೆಚ್ಚಿನ ಕಾಲ ಹೊರಗಿರುವುದನ್ನು ಕಡಿಮೆ ಮಾಡಿ.`,
    unhealthy: (location, aqi) => `${location} ಗಾಗಿ ಗಾಳಿಯ ಗುಣಮಟ್ಟ ಎಚ್ಚರಿಕೆ. ಪ್ರಸ್ತುತ AQI ${aqi}. ಗಾಳಿಮಟ್ಟ ಆರೋಗ್ಯಕರವಲ್ಲ. ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಿ.`,
    hazardous: (location, aqi) => `${location} ಗಾಗಿ ಪ್ರಮುಖ ಗಾಳಿಯ ಗುಣಮಟ್ಟ ಎಚ್ಚರಿಕೆ. ಪ್ರಸ್ತುತ AQI ${aqi}. ಗಾಳಿಮಟ್ಟ ಅಪಾಯಕಾರಿಯಾಗಿದೆ. ಹೆಚ್ಚು ಸಮಯ ಹೊರಗೆ ಇರುವುದನ್ನು ತಪ್ಪಿಸಿ.`,
  },
  'ml-IN': {
    good: (location, aqi) => `${location} നുള്ള വായു ഗുണനിലവാര അപ്ഡേറ്റ്. നിലവിലെ AQI ${aqi}. വായു ഗുണനിലവാരം നല്ലതാണ്.`,
    moderate: (location, aqi) => `${location} നുള്ള വായു ഗുണനിലവാര മുന്നറിയിപ്പ്. നിലവിലെ AQI ${aqi}. വായു ഗുണനിലവാരം മിതമാണ്. ദീർഘനേരം പുറത്തു താമസിക്കുന്നത് കുറയ്ക്കുക.`,
    unhealthy: (location, aqi) => `${location} നുള്ള വായു ഗുണനിലവാര മുന്നറിയിപ്പ്. നിലവിലെ AQI ${aqi}. വായു ഗുണനിലവാരം ആരോഗ്യത്തിന് ഹാനികരമാണ്. പുറം പ്രവർത്തനങ്ങൾ കുറയ്ക്കുക.`,
    hazardous: (location, aqi) => `${location} നുള്ള പ്രധാന വായു ഗുണനിലവാര മുന്നറിയിപ്പ്. നിലവിലെ AQI ${aqi}. വായു ഗുണനിലവാരം അപകടകരമാണ്. ദീർഘനേരം പുറത്ത് പോയത് ഒഴിവാക്കുക.`,
  },
  'pa-IN': {
    good: (location, aqi) => `${location} ਲਈ ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਅਪਡੇਟ। ਮੌਜੂਦਾ AQI ${aqi} ਹੈ। ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਚੰਗੀ ਹੈ।`,
    moderate: (location, aqi) => `${location} ਲਈ ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਚੇਤਾਵਨੀ। ਮੌਜੂਦਾ AQI ${aqi} ਹੈ। ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਦਰਮਿਆਨੀ ਹੈ। ਲੰਬੇ ਸਮੇਂ ਲਈ ਬਾਹਰ ਰਹਿਣ ਤੋਂ ਬਚੋ।`,
    unhealthy: (location, aqi) => `${location} ਲਈ ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਚੇਤਾਵਨੀ। ਮੌਜੂਦਾ AQI ${aqi} ਹੈ। ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਗੈਰ-ਸਿਹਤਮੰਦ ਹੈ। ਬਾਹਰੀ ਗਤੀਵਿਧੀਆਂ ਘਟਾਉਣ ਬਾਰੇ ਸੋਚੋ।`,
    hazardous: (location, aqi) => `${location} ਲਈ ਮਹੱਤਵਪੂਰਨ ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਚੇਤਾਵਨੀ। ਮੌਜੂਦਾ AQI ${aqi} ਹੈ। ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਖਤਰਨਾਕ ਹੈ। ਲੰਬੇ ਸਮੇਂ ਲਈ ਬਾਹਰ ਰਹਿਣ ਤੋਂ ਬਚੋ।`,
  },
  'ur-IN': {
    good: (location, aqi) => `${location} کے لیے ہوا کے معیار کی تازہ کاری۔ موجودہ AQI ${aqi} ہے۔ ہوا کا معیار اچھا ہے۔`,
    moderate: (location, aqi) => `${location} کے لیے ہوا کے معیار کی وارننگ۔ موجودہ AQI ${aqi} ہے۔ ہوا کا معیار درمیانہ ہے۔ زیادہ دیر باہر رہنے سے گریز کریں۔`,
    unhealthy: (location, aqi) => `${location} کے لیے ہوا کے معیار کی وارننگ۔ موجودہ AQI ${aqi} ہے۔ ہوا کا معیار غیر صحت بخش ہے۔ بیرونی سرگرمیوں کو محدود کرنے پر غور کریں۔`,
    hazardous: (location, aqi) => `${location} کے لیے اہم ہوا کے معیار کی وارننگ۔ موجودہ AQI ${aqi} ہے۔ ہوا کا معیار خطرناک ہے۔ زیادہ دیر تک باہر رہنے سے گریز کریں۔`,
  },
}

export function isVoiceSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

export function getVoiceLanguages() {
  return LANGUAGE_OPTIONS
}

export function getStoredVoiceLanguage() {
  try {
    return window.localStorage.getItem('airguard-voice-language') || DEFAULT_LANGUAGE
  } catch (e) {
    return DEFAULT_LANGUAGE
  }
}

export function setVoiceLanguage(language) {
  try {
    window.localStorage.setItem('airguard-voice-language', language)
  } catch (e) {
    // ignore
  }
}

export function getAvailableVoices() {
  if (!isVoiceSupported()) return []
  try {
    return window.speechSynthesis.getVoices() || []
  } catch (e) {
    return []
  }
}

export function waitForVoices(timeout = 2000) {
  return new Promise((resolve) => {
    if (!isVoiceSupported()) return resolve([])

    const synth = window.speechSynthesis
    let voices = synth.getVoices()
    if (voices && voices.length) return resolve(voices)

    const handler = () => {
      voices = synth.getVoices() || []
      synth.removeEventListener('voiceschanged', handler)
      resolve(voices)
    }

    synth.addEventListener('voiceschanged', handler)

    setTimeout(() => {
      try { synth.removeEventListener('voiceschanged', handler) } catch (e) {}
      resolve(synth.getVoices() || [])
    }, timeout)
  })
}

export async function getAvailableSpeechVoices() {
  const voices = await waitForVoices()
  return (voices || []).map((v) => ({ name: v.name, lang: v.lang, localService: Boolean(v.localService), default: Boolean(v.default) }))
}

function findBestVoice(language, voices) {
  if (!language || !Array.isArray(voices)) return null
  const req = String(language).toLowerCase()
  const base = req.split('-')[0]

  let match = voices.find((v) => (v.lang || '').toLowerCase() === req)
  if (match) return match

  match = voices.find((v) => (v.lang || '').toLowerCase() === base)
  if (match) return match

  const baseMatches = voices.filter((v) => (v.lang || '').toLowerCase().startsWith(base))
  if (baseMatches.length) {
    if (req.includes('-in')) {
      const ind = baseMatches.find((v) => (v.lang || '').toLowerCase().includes('-in') || (v.name || '').toLowerCase().includes('india'))
      if (ind) return ind
    }
    return baseMatches[0]
  }

  return null
}

export async function getBestVoiceForLanguage(language) {
  if (!isVoiceSupported()) return null
  const voices = await waitForVoices()
  return findBestVoice(language, voices)
}

function getSeverityFromAqi(aqi) {
  const value = Number(aqi) || 0
  if (value <= 50) return 'good'
  if (value <= 100) return 'moderate'
  if (value <= 200) return 'unhealthy'
  return 'hazardous'
}

export function buildVoiceAlertMessage({ location, aqi, language = getStoredVoiceLanguage() }) {
  const selectedLanguage = ALERT_MESSAGES[language] ? language : DEFAULT_LANGUAGE
  const severity = getSeverityFromAqi(aqi)
  return ALERT_MESSAGES[selectedLanguage][severity](location, aqi)
}

// ---------------------------------------------------------------------------
// Sequential Voice Speech Queue System
// ---------------------------------------------------------------------------

let speechQueue = []
let isProcessingQueue = false

async function processSpeechQueue() {
  if (isProcessingQueue || speechQueue.length === 0) return
  isProcessingQueue = true

  const item = speechQueue.shift()

  try {
    if (isVoiceSupported()) {
      const synth = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(String(item.text))
      utterance.lang = item.options.language || getStoredVoiceLanguage()
      utterance.rate = item.options.rate || 0.92
      utterance.pitch = item.options.pitch || 1
      utterance.volume = item.options.volume || 1

      const best = await getBestVoiceForLanguage(utterance.lang)
      if (best) utterance.voice = best

      await new Promise((resolve) => {
        utterance.onend = () => resolve({ success: true })
        utterance.onerror = (err) => resolve({ success: false, error: err })
        try {
          synth.speak(utterance)
        } catch (e) {
          resolve({ success: false, error: e })
        }
      })
    }
  } catch (err) {
    console.error('Error in voice queue item:', err)
  } finally {
    isProcessingQueue = false
    if (speechQueue.length > 0) {
      processSpeechQueue()
    }
  }
}

export function enqueueVoiceAlert({ location, aqi, language = getStoredVoiceLanguage() }) {
  const text = buildVoiceAlertMessage({ location, aqi, language })
  speechQueue.push({ text, options: { language, rate: 0.9, pitch: 1, volume: 1 } })
  processSpeechQueue()
}

export async function speakText(text, { language = getStoredVoiceLanguage(), rate = 0.92, pitch = 1, volume = 1 } = {}) {
  try {
    if (!isVoiceSupported()) return { success: false, reason: 'not-supported' }
    const synth = window.speechSynthesis
    try { synth.cancel() } catch (e) {}

    const utterance = new SpeechSynthesisUtterance(String(text))
    utterance.lang = language
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    const best = await getBestVoiceForLanguage(language)
    if (best) utterance.voice = best

    return await new Promise((resolve) => {
      utterance.onend = () => resolve({ success: true })
      utterance.onerror = (err) => resolve({ success: false, error: err })
      try { synth.speak(utterance) } catch (e) { resolve({ success: false, error: e }) }
    })
  } catch (e) {
    return { success: false, error: e }
  }
}

export async function speakAirQualityAlert({ location, aqi, language = getStoredVoiceLanguage() }) {
  enqueueVoiceAlert({ location, aqi, language })
}

export function stopVoiceAlert() {
  speechQueue = []
  if (!isVoiceSupported()) return { success: false }
  try {
    window.speechSynthesis.cancel()
    return { success: true }
  } catch (e) {
    return { success: false, error: e }
  }
}

export async function testVoiceAlert(language = getStoredVoiceLanguage()) {
  const message = language === 'hi-IN' ? 'यह AeroGuard का परीक्षण वॉयس अलर्ट है। आपकी वॉयस अलर्ट सेवा सही तरीके से काम कर रही है।' : language === 'mr-IN' ? 'हा AeroGuard चा चाचणी व्हॉइस अलर्ट आहे. तुमची व्हॉइस अलर्ट सेवा योग्यरित्या काम करत आहे.' : 'This is an AeroGuard test voice alert. Your voice alert system is working correctly.'
  return speakText(message, { language, rate: 0.9, pitch: 1, volume: 1 })
}
