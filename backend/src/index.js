import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AirGuard Backend Engine',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/air-quality', async (req, res) => {
  const { lat, lng, latitude, longitude } = req.query
  const targetLat = lat || latitude
  const targetLng = lng || longitude

  if (!targetLat || !targetLng) {
    return res.status(400).json({ error: 'Latitude (lat) and longitude (lng) are required.' })
  }

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${targetLat}&longitude=${targetLng}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Open-Meteo API returned HTTP ${response.status}`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch air quality data', details: err.message })
  }
})

app.get('/api/locations/search', async (req, res) => {
  const { query, name } = req.query
  const searchQuery = query || name

  if (!searchQuery) {
    return res.json({ results: [] })
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=8&language=en&format=json`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Geocoding API returned HTTP ${response.status}`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to search location', details: err.message })
  }
})

app.post('/api/risk-analysis', (req, res) => {
  const { aqi, profileType = 'general' } = req.body
  const numericAqi = Number(aqi) || 0

  let level = 'Good'
  let color = '#22A85F'
  if (numericAqi > 300) { level = 'Hazardous'; color = '#7A2035' }
  else if (numericAqi > 200) { level = 'Very Unhealthy'; color = '#9A3FBF' }
  else if (numericAqi > 150) { level = 'Unhealthy'; color = '#D8492E' }
  else if (numericAqi > 100) { level = 'Unhealthy for Sensitive Groups'; color = '#E5822A' }
  else if (numericAqi > 50) { level = 'Moderate'; color = '#D6A70C' }

  res.json({
    aqi: numericAqi,
    profileType,
    riskLevel: level,
    color,
    timestamp: new Date().toISOString(),
  })
})

app.listen(PORT, () => {
  console.log(`AirGuard Backend running on port ${PORT}`)
})
