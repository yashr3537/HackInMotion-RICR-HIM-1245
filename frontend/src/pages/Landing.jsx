import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ArrowRight, Activity, Gauge, Compass as CompassIcon, TrendingUp, Bell, Footprints,
  ShieldCheck, MapPin, Loader2, Sparkles,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RiskBadge from '../components/RiskBadge'
import AQIGauge from '../components/AQIGauge'
import { features, howItWorks, currentLocation } from '../data/demoData'
import { getAirQuality } from '../data/airQualityApi'
import { useLanguage } from '../i18n/index.jsx'

const FEATURE_ICONS = {
  activity: Activity,
  gauge: Gauge,
  compass: CompassIcon,
  trending: TrendingUp,
  bell: Bell,
  footprints: Footprints,
}

export default function Landing() {
  const { t } = useLanguage()
  const [liveAQI, setLiveAQI] = useState(null)
  const [livePM25, setLivePM25] = useState(null)
  const [livePM10, setLivePM10] = useState(null)
  const [locationName, setLocationName] = useState('Your current location')
  const [loadingAQI, setLoadingAQI] = useState(true)
  const [aqiError, setAqiError] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) {
      setAqiError('Location is not supported by your browser.')
      setLoadingAQI(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          const airQuality = await getAirQuality(latitude, longitude)

          setLiveAQI(airQuality.aqi)
          setLivePM25(airQuality.pm25)
          setLivePM10(airQuality.pm10)

          // Try to get the current city name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
            )
            const data = await response.json()
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.suburb ||
              data.address?.county
            if (city) {
              setLocationName(city)
            }
          } catch (e) {
            console.error('Failed to get location name:', e)
          }
        } catch (err) {
          console.error('Failed to fetch live air quality:', err)
          setAqiError('Could not fetch live AQI data for your location.')
        } finally {
          setLoadingAQI(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setAqiError('Location access denied or unavailable.')
        setLoadingAQI(false)
      },
      { timeout: 10000 }
    )
  }, [])

  const effectiveAQI = liveAQI !== null ? liveAQI : currentLocation.aqi
  const effectivePM25 = livePM25 !== null ? livePM25 : currentLocation.pm25
  const effectivePM10 = livePM10 !== null ? livePM10 : currentLocation.pm10
  const effectiveLocationName = liveAQI !== null ? locationName : currentLocation.name

  return (
    <div className="min-h-screen bg-canvas text-ink-900 flex flex-col font-sans antialiased overflow-x-hidden">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-ink-100/60 bg-gradient-to-b from-canvas via-surface/30 to-canvas">

        {/* Ambient background blur elements */}
        <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-forest-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-40 -z-10 h-60 w-60 rounded-full bg-mist-400/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute left-10 top-72 -z-10 h-52 w-52 rounded-full bg-sage-400/15 blur-2xl animate-float-gentle" />

        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-20 left-[15%] w-2 h-2 rounded-full bg-forest-400/30 animate-drift"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="absolute top-40 right-[20%] w-3 h-3 rounded-full bg-sage-400/20 animate-drift"
            style={{ animationDelay: '1.2s' }}
          />
          <div
            className="absolute top-56 right-[30%] w-1.5 h-1.5 rounded-full bg-forest-400/40 animate-drift"
            style={{ animationDelay: '0.6s' }}
          />
          <div
            className="absolute bottom-24 left-[38%] w-2 h-2 rounded-full bg-mist-500/40 animate-drift"
            style={{ animationDelay: '1.8s' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 grid lg:grid-cols-2 gap-14 items-center">

          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 bg-forest-100 text-forest-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <ShieldCheck size={13} />
              {t('landing.realtimeIntelligence')}
              <Sparkles size={12} className="text-forest-600" />
            </div>

            <h1 className="text-reveal font-display text-4xl font-semibold leading-[1.06] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.6rem]">
              {t('landing.heroTitlePart1')}
              <br />
              <span className="text-forest-700">{t('landing.heroTitlePart2')}</span>
            </h1>

            <p
              className="fade-up mt-5 max-w-md text-base leading-relaxed text-ink-700 sm:text-lg"
              style={{ animationDelay: '160ms' }}
            >
              {t('landing.heroDescription')}
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm px-5 py-3.5 rounded-lg transition-colors shadow-lift"
              >
                {t('landing.checkAirQuality')}
                <ArrowRight size={16} />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-2 bg-surface border border-ink-200 hover:border-forest-400 text-ink-900 font-semibold text-sm px-5 py-3.5 rounded-lg transition-colors"
              >
                {t('landing.exploreFeatures')}
                <CompassIcon size={16} />
              </a>
            </div>

            {/* Quick stats highlight */}
            <div className="mt-10 pt-6 border-t border-ink-100 flex items-center gap-8 text-xs text-ink-600">
              <div>
                <span className="block text-base font-semibold text-ink-900">100%</span>
                {t('landing.statPersonalized')}
              </div>
              <div className="w-px h-8 bg-ink-200" />
              <div>
                <span className="block text-base font-semibold text-ink-900">24/7</span>
                {t('landing.statMonitoring')}
              </div>
              <div className="w-px h-8 bg-ink-200" />
              <div>
                <span className="block text-base font-semibold text-ink-900">11</span>
                {t('landing.statLanguages')}
              </div>
            </div>
          </div>

          {/* Hero AQI Card Preview */}
          <div className="lg:pl-6">
            <div className="card-hover bg-surface rounded-xl2 border border-ink-100 p-6 sm:p-8 shadow-card relative">

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink-100">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-forest-700 shrink-0" />
                  <span className="text-sm font-semibold text-ink-900 truncate">
                    {effectiveLocationName}
                  </span>
                  {liveAQI !== null && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-forest-100 text-forest-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-pulse" />
                      {t('common.live')}
                    </span>
                  )}
                </div>

                <RiskBadge level={currentLocation.riskLevel} />
              </div>

              {loadingAQI ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 size={32} className="text-forest-700 animate-spin mb-3" />
                  <p className="text-xs text-ink-500 font-medium">Fetching live air quality data...</p>
                </div>
              ) : (
                <>
                  {aqiError && (
                    <div className="mb-4 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      {aqiError} — Showing sample data for {currentLocation.name}.
                    </div>
                  )}

                  {/* AQI Gauge Display */}
                  <div className="py-2">
                    <AQIGauge value={effectiveAQI} status={currentLocation.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-ink-100 text-xs">
                    <div className="bg-canvas rounded-lg p-3 border border-ink-100">
                      <span className="text-ink-500 block text-[11px] mb-0.5">PM2.5</span>
                      <span className="font-semibold text-ink-900 text-sm">{effectivePM25} µg/m³</span>
                    </div>

                    <div className="bg-canvas rounded-lg p-3 border border-ink-100">
                      <span className="text-ink-500 block text-[11px] mb-0.5">PM10</span>
                      <span className="font-semibold text-ink-900 text-sm">{effectivePM10} µg/m³</span>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-5 p-3 rounded-lg bg-forest-50 border border-forest-100 text-xs text-forest-900 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-forest-700 shrink-0 mt-0.5" />
                <span>
                  {currentLocation.recommendation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24 scroll-mt-16">
        <div className="max-w-xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-700 mb-3">
            {t('landing.featuresHeading')}
          </p>

          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-ink-900 tracking-tight">
            {t('landing.featuresTitle')}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = FEATURE_ICONS[f.icon] || Activity

            return (
              <div
                key={f.key}
                className="bg-surface rounded-xl2 border border-ink-100 p-6 hover:shadow-card hover:-translate-y-0.5 transition-all"
              >
                <div className="w-11 h-11 rounded-lg bg-forest-100 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-forest-700" />
                </div>

                <h3 className="font-display mb-1.5 font-semibold text-ink-900">
                  {t(f.titleKey || 'features.' + f.key + '.title', { defaultValue: f.title })}
                </h3>

                <p className="text-sm leading-relaxed text-ink-700">
                  {t(f.descriptionKey || 'features.' + f.key + '.description', { defaultValue: f.description })}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="bg-forest-50/60 py-20 sm:py-24 scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          <div className="max-w-xl mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-forest-700 mb-3">
              {t('landing.howItWorksHeading')}
            </p>

            <h2 className="font-display font-semibold text-3xl sm:text-4xl text-ink-900 tracking-tight">
              {t('landing.howItWorksTitle')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {howItWorks.map((s, i) => (
              <div key={s.step} className="relative">

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-forest-700 text-white font-display font-semibold flex items-center justify-center shrink-0">
                    {s.step}
                  </div>

                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block flex-1 h-px bg-forest-200" />
                  )}
                </div>

                <h3 className="font-display mb-1.5 mt-4 font-semibold text-ink-900">
                  {t(s.titleKey || ('howItWorks.step' + s.step + '.title'), { defaultValue: s.title })}
                </h3>

                <p className="text-sm leading-relaxed text-ink-700">
                  {t(s.descriptionKey || ('howItWorks.step' + s.step + '.description'), { defaultValue: s.description })}
                </p>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / CTA */}
      <section
        id="about"
        className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24 scroll-mt-16"
      >
        <div className="bg-gradient-to-br from-forest-900 to-forest-700 rounded-xl2 px-6 sm:px-14 py-14 sm:py-16 text-center relative overflow-hidden">

          <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-forest-500/20 blur-3xl" />

          <div className="relative">

            <h2 className="font-display font-semibold text-3xl sm:text-4xl text-white tracking-tight max-w-xl mx-auto">
              {t('landing.ctaTitle')}
            </h2>

            <p className="text-forest-100/90 mt-4 max-w-md mx-auto leading-relaxed">
              {t('landing.ctaDescription')}
            </p>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-forest-800 font-semibold text-sm px-5 py-3.5 rounded-lg mt-8 hover:bg-forest-50 transition-colors"
            >
              {t('landing.checkAirQuality')}
              <ArrowRight size={16} />
            </Link>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}