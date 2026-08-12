// ============================================================================
// DEMO DATA — centralized mock data for the AirGuard frontend.
//
// This file is the single source of truth for placeholder data while the
// backend/API is not yet connected. Every component reads from here instead
// of hardcoding values, so swapping in real API responses later means
// replacing the exports below (or the functions that produce them) without
// touching component code.
// ============================================================================

export const currentUser = {
  name: 'Yogesh',
  fullName: 'Yogesh Sharma',
  email: 'yogesh.sharma@example.com',
  profileType: 'general', // general | child | elderly | respiratory | outdoor-worker
  alertThreshold: 100,
  activity: 'Running',
}

export const currentLocation = {
  id: 'loc-bhopal-home',
  name: 'Bhopal',
  region: 'Madhya Pradesh',
  aqi: 82,
  lastUpdated: '5 minutes ago',
  pm25: 28,
  pm10: 54,
}

export const pollutants = [
  { key: 'pm25', label: 'PM2.5', value: 28, unit: 'µg/m³', status: 'moderate', description: 'Fine particulate matter' },
  { key: 'pm10', label: 'PM10', value: 54, unit: 'µg/m³', status: 'moderate', description: 'Coarse particulate matter' },
  { key: 'no2', label: 'NO₂', value: 19, unit: 'µg/m³', status: 'good', description: 'Nitrogen dioxide' },
  { key: 'o3', label: 'O₃', value: 31, unit: 'µg/m³', status: 'good', description: 'Ground-level ozone' },
  { key: 'so2', label: 'SO₂', value: 8, unit: 'µg/m³', status: 'good', description: 'Sulfur dioxide' },
  { key: 'co', label: 'CO', value: 0.4, unit: 'mg/m³', status: 'good', description: 'Carbon monoxide' },
]

export const dominantPollutant = {
  key: 'pm25',
  label: 'PM2.5',
  percentOfLimit: 68,
  description: 'Fine particulate matter is currently the main contributor to air-quality risk.',
}

export const recommendation = {
  headline: 'Outdoor activities are generally okay right now.',
  detail: 'Sensitive individuals should reduce prolonged outdoor exposure.',
  profile: 'General User',
  activity: 'Running',
  verdict: 'Use caution',
}

// ---------------------------------------------------------------------------
// Historical trend data
// ---------------------------------------------------------------------------

function buildSeries(points, base, variance) {
  const out = []
  for (let i = 0; i < points; i++) {
    const wobble = Math.sin(i / 2.3) * variance + (Math.random() - 0.5) * variance * 0.6
    out.push(Math.max(8, Math.round(base + wobble)))
  }
  return out
}

const hoursLabels = ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm']
const daysLabels7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const daysLabels30 = Array.from({ length: 30 }, (_, i) => `${i + 1}`)

const seed24 = [58, 52, 48, 46, 55, 68, 79, 88, 92, 85, 74, 62]
const seed7 = [74, 81, 88, 95, 90, 79, 82]
const seed30 = [95, 92, 88, 84, 90, 96, 101, 98, 93, 87, 82, 79, 84, 90, 95, 99, 93, 88, 82, 78, 75, 79, 84, 88, 92, 87, 81, 76, 79, 82]

export const trendData = {
  '24h': hoursLabels.map((label, i) => ({ label, aqi: seed24[i], pm25: Math.round(seed24[i] * 0.34), pm10: Math.round(seed24[i] * 0.66) })),
  '7d': daysLabels7.map((label, i) => ({ label, aqi: seed7[i], pm25: Math.round(seed7[i] * 0.34), pm10: Math.round(seed7[i] * 0.66) })),
  '30d': daysLabels30.map((label, i) => ({ label, aqi: seed30[i], pm25: Math.round(seed30[i] * 0.34), pm10: Math.round(seed30[i] * 0.66) })),
}

export const trendStats = {
  '24h': { avg: 67, best: 46, worst: 92, changePercent: -8 },
  '7d': { avg: 84, best: 74, worst: 95, changePercent: -6 },
  '30d': { avg: 87, best: 75, worst: 101, changePercent: -11 },
}

export const trendDirection = 'improving' // 'improving' | 'worsening' | 'stable'

// ---------------------------------------------------------------------------
// Saved locations
// ---------------------------------------------------------------------------

export const savedLocations = [
  {
    id: 'loc-home',
    type: 'Home',
    icon: 'home',
    name: 'Bhopal',
    region: 'Arera Colony',
    aqi: 82,
    lastUpdated: '5 minutes ago',
    alertThreshold: 100,
  },
  {
    id: 'loc-college',
    type: 'College',
    icon: 'school',
    name: 'Bhopal',
    region: 'MANIT Campus',
    aqi: 91,
    lastUpdated: '12 minutes ago',
    alertThreshold: 100,
  },
  {
    id: 'loc-favorite',
    type: 'Favorite',
    icon: 'star',
    name: 'Indore',
    region: 'Vijay Nagar',
    aqi: 64,
    lastUpdated: '20 minutes ago',
    alertThreshold: 100,
  },
]

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export const alerts = [
  {
    id: 'alert-1',
    severity: 'critical',
    title: 'Air Quality Alert',
    message: 'Air quality at Home has entered an unhealthy zone.',
    aqi: 167,
    time: '2 hours ago',
    read: false,
    location: 'Home · Bhopal',
  },
  {
    id: 'alert-2',
    severity: 'warning',
    title: 'Rising Trend',
    message: 'AQI at College has increased by 18 points since morning.',
    aqi: 91,
    time: '6 hours ago',
    read: false,
    location: 'College · Bhopal',
  },
  {
    id: 'alert-3',
    severity: 'info',
    title: 'Air Quality Improved',
    message: 'Air quality at Indore is back to the Good range.',
    aqi: 48,
    time: 'Yesterday',
    read: true,
    location: 'Favorite · Indore',
  },
  {
    id: 'alert-4',
    severity: 'info',
    title: 'Weekly Summary Ready',
    message: 'Your 7-day air quality summary for Bhopal is ready to view.',
    aqi: null,
    time: '2 days ago',
    read: true,
    location: 'Home · Bhopal',
  },
]

// ---------------------------------------------------------------------------
// Activity risk advisor
// ---------------------------------------------------------------------------

export const activities = [
  { key: 'running', label: 'Running', icon: 'running' },
  { key: 'cycling', label: 'Cycling', icon: 'cycling' },
  { key: 'walking', label: 'Walking', icon: 'walking' },
  { key: 'sports', label: 'Outdoor Sports', icon: 'sports' },
  { key: 'work', label: 'Outdoor Work', icon: 'work' },
]

export const activityRiskData = {
  running: { risk: 'moderate', verdict: 'Use caution', reason: 'Current air quality may make prolonged intense outdoor activity less comfortable.' },
  cycling: { risk: 'moderate', verdict: 'Use caution', reason: 'Sustained exertion at this AQI level may increase exposure for sensitive individuals.' },
  walking: { risk: 'good', verdict: 'Generally fine', reason: 'Light activity at this air quality level is unlikely to cause discomfort for most people.' },
  sports: { risk: 'moderate', verdict: 'Use caution', reason: 'Team sports involve sustained exertion; sensitive individuals should consider shorter sessions.' },
  work: { risk: 'sensitive', verdict: 'Take precautions', reason: 'Extended outdoor work may increase exposure — consider breaks and monitor how you feel.' },
}

// ---------------------------------------------------------------------------
// Location comparison
// ---------------------------------------------------------------------------

export const compareLocations = [
  { id: 'cmp-bhopal', name: 'Bhopal', region: 'Madhya Pradesh', aqi: 82 },
  { id: 'cmp-indore', name: 'Indore', region: 'Madhya Pradesh', aqi: 64 },
  { id: 'cmp-delhi', name: 'Delhi', region: 'Delhi NCR', aqi: 173 },
  { id: 'cmp-mumbai', name: 'Mumbai', region: 'Maharashtra', aqi: 72 },
]

// ---------------------------------------------------------------------------
// Explore / search results
// ---------------------------------------------------------------------------

export const exploreResults = [
  { id: 'exp-bhopal', name: 'Bhopal', region: 'Madhya Pradesh', aqi: 82 },
  { id: 'exp-indore', name: 'Indore', region: 'Madhya Pradesh', aqi: 64 },
  { id: 'exp-delhi', name: 'Delhi', region: 'Delhi NCR', aqi: 173 },
  { id: 'exp-mumbai', name: 'Mumbai', region: 'Maharashtra', aqi: 72 },
  { id: 'exp-jabalpur', name: 'Jabalpur', region: 'Madhya Pradesh', aqi: 58 },
  { id: 'exp-gwalior', name: 'Gwalior', region: 'Madhya Pradesh', aqi: 104 },
  { id: 'exp-bengaluru', name: 'Bengaluru', region: 'Karnataka', aqi: 51 },
  { id: 'exp-pune', name: 'Pune', region: 'Maharashtra', aqi: 69 },
]

// ---------------------------------------------------------------------------
// Landing page content
// ---------------------------------------------------------------------------

export const features = [
  { key: 'live', icon: 'activity', title: 'Live Air Quality', description: 'Monitor real-time air quality for any location.' },
  { key: 'risk', icon: 'gauge', title: 'Risk Intelligence', description: 'Turn complex pollution data into an easy-to-understand risk level.' },
  { key: 'guidance', icon: 'compass', title: 'Personalized Guidance', description: 'Get recommendations based on your environmental sensitivity.' },
  { key: 'trends', icon: 'trending', title: 'Historical Trends', description: 'Understand whether air quality is improving or worsening.' },
  { key: 'alerts', icon: 'bell', title: 'Smart Alerts', description: 'Know when your saved locations become risky.' },
  { key: 'activity', icon: 'footprints', title: 'Activity Risk Advisor', description: 'Check whether running, cycling or outdoor activities are suitable right now.' },
]

export const howItWorks = [
  { step: 1, title: 'Choose Location', description: 'Search any city or use your current location to get started.' },
  { step: 2, title: 'Get Live Data', description: 'AirGuard pulls the latest pollutant readings for that location.' },
  { step: 3, title: 'Understand Your Risk', description: 'See a clear risk level based on your environmental profile.' },
  { step: 4, title: 'Take Action', description: 'Follow tailored guidance on activity, exposure, and precautions.' },
]
