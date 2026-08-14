// Central AQI classification logic.
// Swap thresholds here later if the backend uses a different standard (e.g. US EPA vs CPCB).

export const AQI_BANDS = [
  {
    key: 'good',
    label: 'Good',
    max: 50,
    color: '#22A85F',
    bg: '#E6F7EC',
    advice: 'Air quality is satisfactory and poses little or no risk.',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    max: 100,
    color: '#D6A70C',
    bg: '#FBF3D9',
    advice: 'Air quality is acceptable, but sensitive individuals should take caution.',
  },
  {
    key: 'sensitive',
    label: 'Unhealthy for Sensitive Groups',
    max: 150,
    color: '#E5822A',
    bg: '#FCEADA',
    advice:
      'Sensitive groups may experience health effects. General public is less likely to be affected.',
  },
  {
    key: 'unhealthy',
    label: 'Unhealthy',
    max: 200,
    color: '#D8492E',
    bg: '#FBE2DC',
    advice: 'Everyone may begin to experience health effects. Limit prolonged outdoor exertion.',
  },
  {
    key: 'veryunhealthy',
    label: 'Very Unhealthy',
    max: 300,
    color: '#9A3FBF',
    bg: '#F1E1F8',
    advice: 'Health alert: everyone may experience more serious health effects.',
  },
  {
    key: 'hazardous',
    label: 'Hazardous',
    max: 999,
    color: '#7A2035',
    bg: '#F1DDE1',
    advice: 'Health warning of emergency conditions. Entire population is likely to be affected.',
  },
]

export function getAqiBand(aqi) {
  if (aqi === null || aqi === undefined || isNaN(Number(aqi))) {
    return {
      key: 'unknown',
      label: 'Unavailable',
      max: 999,
      color: '#6B7280',
      bg: '#F3F4F6',
      advice: 'Live air quality data is currently unavailable for this location.',
    }
  }
  const numericAqi = Number(aqi)
  return AQI_BANDS.find((b) => numericAqi <= b.max) || AQI_BANDS[AQI_BANDS.length - 1]
}

export function aqiPercent(aqi) {
  if (aqi === null || aqi === undefined || isNaN(Number(aqi))) {
    return 0
  }
  return Math.min(100, Math.round((Number(aqi) / 300) * 100))
}

export function calculatePollutantStatus(key, value) {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 'good'
  }
  const v = Number(value)

  switch (key) {
    case 'pm25':
      if (v <= 12) return 'good'
      if (v <= 35.4) return 'moderate'
      if (v <= 55.4) return 'sensitive'
      if (v <= 150.4) return 'unhealthy'
      return 'hazardous'
    case 'pm10':
      if (v <= 54) return 'good'
      if (v <= 154) return 'moderate'
      if (v <= 254) return 'sensitive'
      if (v <= 354) return 'unhealthy'
      return 'hazardous'
    case 'no2':
      if (v <= 53) return 'good'
      if (v <= 100) return 'moderate'
      if (v <= 360) return 'sensitive'
      return 'unhealthy'
    case 'o3':
      if (v <= 100) return 'good'
      if (v <= 160) return 'moderate'
      if (v <= 215) return 'sensitive'
      return 'unhealthy'
    case 'so2':
      if (v <= 75) return 'good'
      if (v <= 185) return 'moderate'
      if (v <= 304) return 'sensitive'
      return 'unhealthy'
    case 'co': {
      const coMg = v > 50 ? v / 1000 : v
      if (coMg <= 4.4) return 'good'
      if (coMg <= 9.4) return 'moderate'
      if (coMg <= 12.4) return 'sensitive'
      return 'unhealthy'
    }
    default:
      return 'good'
  }
}

export function formatPollutants(data) {
  if (!data) return []

  const coVal =
    data.co !== null && data.co !== undefined && !isNaN(Number(data.co))
      ? Number(data.co) > 50
        ? Number((Number(data.co) / 1000).toFixed(1))
        : Number(Number(data.co).toFixed(1))
      : null

  return [
    {
      key: 'pm25',
      label: 'PM2.5',
      value: data.pm25 !== null && data.pm25 !== undefined ? Math.round(Number(data.pm25)) : null,
      unit: 'µg/m³',
      status: calculatePollutantStatus('pm25', data.pm25),
      description: 'Fine particulate matter',
    },
    {
      key: 'pm10',
      label: 'PM10',
      value: data.pm10 !== null && data.pm10 !== undefined ? Math.round(Number(data.pm10)) : null,
      unit: 'µg/m³',
      status: calculatePollutantStatus('pm10', data.pm10),
      description: 'Coarse particulate matter',
    },
    {
      key: 'no2',
      label: 'NO₂',
      value: data.no2 !== null && data.no2 !== undefined ? Math.round(Number(data.no2)) : null,
      unit: 'µg/m³',
      status: calculatePollutantStatus('no2', data.no2),
      description: 'Nitrogen dioxide',
    },
    {
      key: 'o3',
      label: 'O₃',
      value: data.o3 !== null && data.o3 !== undefined ? Math.round(Number(data.o3)) : null,
      unit: 'µg/m³',
      status: calculatePollutantStatus('o3', data.o3),
      description: 'Ground-level ozone',
    },
    {
      key: 'so2',
      label: 'SO₂',
      value: data.so2 !== null && data.so2 !== undefined ? Math.round(Number(data.so2)) : null,
      unit: 'µg/m³',
      status: calculatePollutantStatus('so2', data.so2),
      description: 'Sulfur dioxide',
    },
    {
      key: 'co',
      label: 'CO',
      value: coVal,
      unit: 'mg/m³',
      status: calculatePollutantStatus('co', data.co),
      description: 'Carbon monoxide',
    },
  ]
}

export function getDominantPollutant(pollutantsList) {
  if (!pollutantsList || pollutantsList.length === 0) return null
  const order = { hazardous: 5, unhealthy: 4, sensitive: 3, moderate: 2, good: 1 }
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
  if (!maxItem) return null
  return {
    key: maxItem.key,
    label: maxItem.label,
    percentOfLimit: Math.min(100, Math.round((maxItem.value / 100) * 100)),
    description: `${maxItem.label} is currently the main contributor to air-quality risk.`,
  }
}

export function getRecommendationForAqi(aqi, activity = 'Running') {
  if (aqi === null || aqi === undefined || isNaN(Number(aqi))) {
    return {
      headline: 'Live data unavailable',
      detail: 'Could not fetch live AQI data to determine environmental recommendations.',
      profile: 'General User',
      activity,
      verdict: 'Data unavailable',
    }
  }
  const band = getAqiBand(aqi)
  let headline = 'Outdoor activities are generally fine.'
  let verdict = 'Good to go'
  if (band.key === 'good') {
    headline = 'Air quality is great for outdoor activities.'
    verdict = 'Enjoy outdoors'
  } else if (band.key === 'moderate') {
    headline = 'Outdoor activities are generally fine right now.'
    verdict = 'Use caution'
  } else if (band.key === 'sensitive') {
    headline = 'Sensitive groups should reduce prolonged outdoor exertion.'
    verdict = 'Take care'
  } else if (band.key === 'unhealthy' || band.key === 'veryunhealthy') {
    headline = 'Air quality is poor. Avoid prolonged outdoor exertion.'
    verdict = 'Limit exposure'
  } else if (band.key === 'hazardous') {
    headline = 'Air quality is hazardous. Stay indoors if possible.'
    verdict = 'Stay indoors'
  }
  return {
    headline,
    detail: band.advice,
    profile: 'General User',
    activity,
    verdict,
  }
}
