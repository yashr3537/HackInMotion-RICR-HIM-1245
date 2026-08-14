// Centralized Risk Engine for AirGuard

export const AQI_CATEGORIES = [
  {
    key: 'good',
    label: 'Good',
    max: 50,
    color: '#22A85F',
    bg: '#E6F7EC',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    advice: 'Air quality is satisfactory and poses little or no risk.',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    max: 100,
    color: '#D6A70C',
    bg: '#FBF3D9',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    advice:
      'Air quality is acceptable; sensitive individuals should consider limiting prolonged exposure.',
  },
  {
    key: 'sensitive',
    label: 'Unhealthy for Sensitive Groups',
    max: 150,
    color: '#E5822A',
    bg: '#FCEADA',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    advice: 'Sensitive groups may experience health effects. General public is less affected.',
  },
  {
    key: 'unhealthy',
    label: 'Unhealthy',
    max: 200,
    color: '#D8492E',
    bg: '#FBE2DC',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    advice: 'Everyone may begin to experience health effects. Limit outdoor exertion.',
  },
  {
    key: 'veryunhealthy',
    label: 'Very Unhealthy',
    max: 300,
    color: '#9A3FBF',
    bg: '#F1E1F8',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    advice: 'Health alert: serious risk of respiratory symptoms for all populations.',
  },
  {
    key: 'hazardous',
    label: 'Hazardous',
    max: 9999,
    color: '#7A2035',
    bg: '#F1DDE1',
    badgeClass: 'bg-red-900 text-red-100 border-red-700',
    advice: 'Health warning of emergency conditions. Entire population is likely affected.',
  },
]

export function getAqiCategory(aqi) {
  if (aqi === null || aqi === undefined || isNaN(Number(aqi))) {
    return {
      key: 'unknown',
      label: 'Unavailable',
      max: 9999,
      color: '#6B7280',
      bg: '#F3F4F6',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
      advice: 'Live air quality data is currently unavailable.',
    }
  }
  const val = Number(aqi)
  return AQI_CATEGORIES.find((cat) => val <= cat.max) || AQI_CATEGORIES[AQI_CATEGORIES.length - 1]
}

export function getDominantPollutant(pollutantsList) {
  if (!Array.isArray(pollutantsList) || pollutantsList.length === 0) {
    return {
      key: 'pm25',
      label: 'PM2.5',
      percentOfLimit: 50,
      description: 'Particulate matter levels measured real-time.',
    }
  }

  const order = { hazardous: 6, veryunhealthy: 5, unhealthy: 4, sensitive: 3, moderate: 2, good: 1 }
  let maxItem = null
  let maxScore = -1

  for (const item of pollutantsList) {
    if (item.value === null || item.value === undefined) continue
    const score = order[item.status] || 1
    if (score > maxScore) {
      maxScore = score
      maxItem = item
    }
  }

  if (!maxItem) {
    return {
      key: 'pm25',
      label: 'PM2.5',
      percentOfLimit: 50,
      description: 'Particulate matter is currently monitored.',
    }
  }

  return {
    key: maxItem.key,
    label: maxItem.label || maxItem.key.toUpperCase(),
    percentOfLimit: Math.min(100, Math.round((Number(maxItem.value) / 100) * 100)),
    description: `${maxItem.label || maxItem.key.toUpperCase()} is currently the primary contributor to air pollution risk.`,
  }
}

export function getPersonalizedGuidance(aqi, profileType = 'general') {
  if (aqi === null || aqi === undefined || isNaN(Number(aqi))) {
    return {
      headline: 'Live data unavailable',
      detail: 'Could not fetch live environmental readings to personalize recommendations.',
      verdict: 'Data unavailable',
      profile: profileType,
    }
  }

  const numAqi = Number(aqi)
  const cat = getAqiCategory(numAqi)

  let headline = 'Outdoor conditions are favorable.'
  let verdict = 'Enjoy outdoors'
  let detail = cat.advice

  if (profileType === 'respiratory' || profileType === 'asthma') {
    if (numAqi > 50) {
      headline = 'Keep inhaler nearby and avoid strenuous outdoor exercise.'
      verdict = 'High Caution'
      detail =
        'As someone with respiratory sensitivities, elevated AQI poses increased symptom risks.'
    }
  } else if (profileType === 'elderly' || profileType === 'senior') {
    if (numAqi > 100) {
      headline = 'Limit outdoor exertion and remain in ventilated indoor spaces.'
      verdict = 'Stay Indoors'
    }
  } else if (profileType === 'child' || profileType === 'children') {
    if (numAqi > 100) {
      headline = 'Reduce heavy outdoor play and ensure hydration.'
      verdict = 'Limit Exposure'
    }
  } else if (profileType === 'outdoor-worker') {
    if (numAqi > 100) {
      headline = 'Wear an N95 mask during shift hours and take regular rest breaks.'
      verdict = 'Use Protection'
    }
  } else {
    if (numAqi <= 50) {
      headline = 'Air quality is excellent for all outdoor activities.'
      verdict = 'Enjoy outdoors'
    } else if (numAqi <= 100) {
      headline = 'Outdoor activities are generally fine right now.'
      verdict = 'Use caution'
    } else if (numAqi <= 150) {
      headline = 'Sensitive groups should reduce prolonged exertion.'
      verdict = 'Take care'
    } else {
      headline = 'Air quality is poor. Avoid prolonged outdoor exertion.'
      verdict = 'Limit exposure'
    }
  }

  return {
    headline,
    detail,
    verdict,
    profile: profileType,
  }
}

export function getActivityRecommendations(aqi, profileType = 'general') {
  const numAqi = aqi !== null && aqi !== undefined && !isNaN(Number(aqi)) ? Number(aqi) : null

  const getVerdict = (activityKey) => {
    if (numAqi === null) {
      return { risk: 'unknown', verdict: 'Data unavailable', reason: 'Unable to check live AQI.' }
    }

    if (numAqi <= 50) {
      return {
        risk: 'good',
        verdict: 'Great to go',
        reason: 'Air quality is fresh and safe for this activity.',
      }
    } else if (numAqi <= 100) {
      if (activityKey === 'running' || activityKey === 'sports') {
        return {
          risk: 'moderate',
          verdict: 'Use caution',
          reason: 'Moderate air pollution; monitor intense breathing.',
        }
      }
      return {
        risk: 'good',
        verdict: 'Generally fine',
        reason: 'Light activity poses low risk right now.',
      }
    } else if (numAqi <= 150) {
      return {
        risk: 'sensitive',
        verdict: 'Limit duration',
        reason: 'Elevated AQI; shorten intense outdoor sessions.',
      }
    } else {
      return {
        risk: 'unhealthy',
        verdict: 'Avoid outdoor',
        reason: 'High pollution risk; switch to indoor activities.',
      }
    }
  }

  return {
    running: getVerdict('running'),
    cycling: getVerdict('cycling'),
    walking: getVerdict('walking'),
    sports: getVerdict('sports'),
    work: getVerdict('work'),
  }
}
