// Central AQI classification logic.
// Swap thresholds here later if the backend uses a different standard (e.g. US EPA vs CPCB).

export const AQI_BANDS = [
  { key: 'good', label: 'Good', max: 50, color: '#22A85F', bg: '#E6F7EC', advice: 'Air quality is satisfactory and poses little or no risk.' },
  { key: 'moderate', label: 'Moderate', max: 100, color: '#D6A70C', bg: '#FBF3D9', advice: 'Air quality is acceptable, but sensitive individuals should take caution.' },
  { key: 'sensitive', label: 'Unhealthy for Sensitive Groups', max: 150, color: '#E5822A', bg: '#FCEADA', advice: 'Sensitive groups may experience health effects. General public is less likely to be affected.' },
  { key: 'unhealthy', label: 'Unhealthy', max: 200, color: '#D8492E', bg: '#FBE2DC', advice: 'Everyone may begin to experience health effects. Limit prolonged outdoor exertion.' },
  { key: 'veryunhealthy', label: 'Very Unhealthy', max: 300, color: '#9A3FBF', bg: '#F1E1F8', advice: 'Health alert: everyone may experience more serious health effects.' },
  { key: 'hazardous', label: 'Hazardous', max: 999, color: '#7A2035', bg: '#F1DDE1', advice: 'Health warning of emergency conditions. Entire population is likely to be affected.' },
]

export function getAqiBand(aqi) {
  return AQI_BANDS.find((b) => aqi <= b.max) || AQI_BANDS[AQI_BANDS.length - 1]
}

export function aqiPercent(aqi) {
  return Math.min(100, Math.round((aqi / 300) * 100))
}
