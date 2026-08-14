export const AQI_LEVELS = {
  GOOD: {
    key: 'good',
    label: 'Good',
    max: 50,
    color: '#22A85F',
    bg: '#E6F7EC',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    description: 'Air quality is satisfactory and poses little or no risk.',
  },
  MODERATE: {
    key: 'moderate',
    label: 'Moderate',
    max: 100,
    color: '#D6A70C',
    bg: '#FBF3D9',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    description: 'Air quality is acceptable. However, sensitive individuals may experience minor symptoms.',
  },
  SENSITIVE: {
    key: 'sensitive',
    label: 'Unhealthy for Sensitive Groups',
    max: 150,
    color: '#E5822A',
    bg: '#FCEADA',
    badgeClass: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    description: 'Members of sensitive groups may experience health effects. General public is less affected.',
  },
  UNHEALTHY: {
    key: 'unhealthy',
    label: 'Unhealthy',
    max: 200,
    color: '#D8492E',
    bg: '#FBE2DC',
    badgeClass: 'bg-red-500/10 text-red-600 border-red-500/20',
    description: 'Everyone may begin to experience health effects. Limit prolonged outdoor exertion.',
  },
  VERY_UNHEALTHY: {
    key: 'veryunhealthy',
    label: 'Very Unhealthy',
    max: 300,
    color: '#9A3FBF',
    bg: '#F1E1F8',
    badgeClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    description: 'Health alert: significant health risk for all population groups. Avoid outdoor activity.',
  },
  HAZARDOUS: {
    key: 'hazardous',
    label: 'Hazardous',
    max: 9999,
    color: '#7A2035',
    bg: '#F1DDE1',
    badgeClass: 'bg-rose-950/20 text-rose-700 border-rose-900/30',
    description: 'Health warning of emergency conditions. Entire population is highly likely to be affected.',
  },
}

export function getAqiCategory(aqi) {
  const numAqi = Number(aqi) || 0
  if (numAqi <= 50) return AQI_LEVELS.GOOD
  if (numAqi <= 100) return AQI_LEVELS.MODERATE
  if (numAqi <= 150) return AQI_LEVELS.SENSITIVE
  if (numAqi <= 200) return AQI_LEVELS.UNHEALTHY
  if (numAqi <= 300) return AQI_LEVELS.VERY_UNHEALTHY
  return AQI_LEVELS.HAZARDOUS
}

export function getDominantPollutant(pollutants = {}) {
  const limits = {
    pm25: 35,
    pm10: 150,
    no2: 100,
    o3: 140,
    co: 10,
    so2: 75,
  }

  let maxRatio = -1
  let dominantKey = 'pm25'

  Object.keys(limits).forEach((key) => {
    const val = Number(pollutants[key]) || 0
    const ratio = val / limits[key]
    if (ratio > maxRatio) {
      maxRatio = ratio
      dominantKey = key
    }
  })

  const labels = {
    pm25: 'PM2.5',
    pm10: 'PM10',
    no2: 'NO₂',
    o3: 'O₃',
    co: 'CO',
    so2: 'SO₂',
  }

  const descriptions = {
    pm25: 'Fine particulate matter is currently the main contributor to air-quality risk.',
    pm10: 'Coarse particulate matter is dust and larger particles suspended in the air.',
    no2: 'Nitrogen dioxide from emissions and combustion is elevated.',
    o3: 'Ground-level ozone is the primary pollutant concern.',
    co: 'Carbon monoxide from combustion sources is noticeable.',
    so2: 'Sulfur dioxide emissions are currently elevated.',
  }

  return {
    key: dominantKey,
    label: labels[dominantKey] || dominantKey.toUpperCase(),
    value: pollutants[dominantKey] ?? null,
    percentOfLimit: Math.min(100, Math.round(maxRatio * 100)),
    description: descriptions[dominantKey] || `${labels[dominantKey]} is the primary pollutant.`,
  }
}

export function getPersonalizedGuidance(aqi, profileType = 'general') {
  const category = getAqiCategory(aqi)

  const matrix = {
    general: {
      good: { headline: 'Air quality is excellent.', detail: 'Enjoy normal outdoor activities without precautions.', verdict: 'Safe outdoors' },
      moderate: { headline: 'Outdoor activities are generally fine.', detail: 'Air quality is acceptable for standard routines.', verdict: 'Generally fine' },
      sensitive: { headline: 'Consider reducing prolonged outdoor exertion.', detail: 'Unusually sensitive individuals should take breaks.', verdict: 'Use caution' },
      unhealthy: { headline: 'Limit strenuous outdoor activities.', detail: 'Everyone should take frequent breaks when outdoors.', verdict: 'Take precautions' },
      veryunhealthy: { headline: 'Avoid outdoor activities.', detail: 'Stay indoors where possible and keep windows closed.', verdict: 'Stay indoors' },
      hazardous: { headline: 'Emergency air pollution advisory.', detail: 'Remain indoors and use air purifiers if available.', verdict: 'Hazardous' },
    },
    respiratory: {
      good: { headline: 'Air quality is safe for respiratory comfort.', detail: 'Keep inhaler accessible as routine precaution.', verdict: 'Safe outdoors' },
      moderate: { headline: 'Sensitive respiratory profile alert.', detail: 'Monitor symptoms; consider wearing an N95 mask outdoors.', verdict: 'Use caution' },
      sensitive: { headline: 'High risk of asthma/respiratory discomfort.', detail: 'Avoid prolonged outdoor exposure. Keep medications handy.', verdict: 'High risk' },
      unhealthy: { headline: 'Dangerous air for respiratory conditions.', detail: 'Stay indoors in air-filtered spaces.', verdict: 'Avoid outdoors' },
      veryunhealthy: { headline: 'Critical respiratory risk zone.', detail: 'Strictly remain indoors and avoid any physical exertion.', verdict: 'Critical' },
      hazardous: { headline: 'Severe health hazard for respiratory patients.', detail: 'Contact healthcare provider if experiencing difficulty breathing.', verdict: 'Emergency' },
    },
  }

  const normalizedProfile = matrix[profileType] ? profileType : 'general'
  const guidance = matrix[normalizedProfile][category.key] || matrix.general[category.key]

  return {
    ...guidance,
    aqi,
    riskLevel: category.label,
    color: category.color,
    badgeClass: category.badgeClass,
  }
}

export function getActivityRecommendations(aqi, profileType = 'general') {
  const numAqi = Number(aqi) || 0
  const getVerdict = (minAqiCaution, minAqiUnsafe) => {
    if (numAqi < minAqiCaution) return { risk: 'good', verdict: 'Generally fine', iconColor: 'text-emerald-500' }
    if (numAqi < minAqiUnsafe) return { risk: 'moderate', verdict: 'Use caution', iconColor: 'text-amber-500' }
    return { risk: 'unhealthy', verdict: 'Avoid', iconColor: 'text-red-500' }
  }

  const sensitivityMultiplier = profileType === 'respiratory' || profileType === 'elderly' ? 0.8 : 1.0

  return {
    running: {
      ...getVerdict(70 * sensitivityMultiplier, 130 * sensitivityMultiplier),
      reason: numAqi > 120 ? 'High inhalation rate during running increases pollutant intake.' : 'Moderate air quality; keep pace light if feeling fatigue.',
    },
    cycling: {
      ...getVerdict(80 * sensitivityMultiplier, 140 * sensitivityMultiplier),
      reason: numAqi > 130 ? 'Avoid high-speed road cycling in high particulate zones.' : 'Sustained aerobic exertion requires monitoring breathing.',
    },
    walking: {
      ...getVerdict(100 * sensitivityMultiplier, 170 * sensitivityMultiplier),
      reason: numAqi > 160 ? 'Light walking is safe only in parks away from traffic.' : 'Light activity is generally safe for most individuals.',
    },
    sports: {
      ...getVerdict(75 * sensitivityMultiplier, 135 * sensitivityMultiplier),
      reason: numAqi > 135 ? 'Consider moving team sports or matches to indoor courts.' : 'Take hydration breaks between sets or quarters.',
    },
    work: {
      ...getVerdict(90 * sensitivityMultiplier, 150 * sensitivityMultiplier),
      reason: numAqi > 150 ? 'Wear an N95 dust mask and limit continuous shift exposure.' : 'Standard outdoor work is acceptable with routine breaks.',
    },
  }
}
