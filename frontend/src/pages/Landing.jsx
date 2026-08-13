import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ArrowRight, Activity, Gauge, Compass as CompassIcon, TrendingUp, Bell, Footprints,
  ShieldCheck, MapPin, Loader2,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RiskBadge from '../components/RiskBadge'
import AQIGauge from '../components/AQIGauge'
<<<<<<< HEAD
import { features, howItWorks } from '../data/demoData'
import { getAirQuality } from '../data/airQualityApi'
=======
import { features, howItWorks, currentLocation } from '../data/demoData'
import { useLanguage } from '../i18n/index.jsx'
>>>>>>> feature/frontend

const FEATURE_ICONS = {
  activity: Activity,
  gauge: Gauge,
  compass: CompassIcon,
  trending: TrendingUp,
  bell: Bell,
  footprints: Footprints,
}

export default function Landing() {
<<<<<<< HEAD
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

            if (response.ok) {
              const locationData = await response.json()

              const address = locationData.address || {}

              const city =
                address.city ||
                address.town ||
                address.village ||
                address.municipality ||
                'Your current location'

              setLocationName(city)
            }
          } catch (locationError) {
            console.warn('Could not determine city name:', locationError)
          }

          setAqiError('')
        } catch (error) {
          console.error('Live AQI error:', error)
          setAqiError('Unable to fetch live air quality.')
        } finally {
          setLoadingAQI(false)
        }
      },
      (error) => {
        console.error('Location permission error:', error)
        setAqiError('Please allow location access to see live AQI.')
        setLoadingAQI(false)
      }
    )
  }, [])
=======
  const { t } = useLanguage()
>>>>>>> feature/frontend

  return (
    <div className="bg-canvas">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[8%] w-2 h-2 rounded-full bg-forest-400/60 animate-drift" />
          <div
            className="absolute top-32 left-[22%] w-1.5 h-1.5 rounded-full bg-mist-500/50 animate-drift"
            style={{ animationDelay: '1.2s' }}
          />
          <div
            className="absolute top-20 right-[18%] w-2.5 h-2.5 rounded-full bg-forest-300/50 animate-drift"
            style={{ animationDelay: '2.1s' }}
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
<<<<<<< HEAD
              Real-time environmental intelligence
            </div>

            <h1 className="font-display font-semibold text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] text-ink-900 tracking-tight">
              Know the air<br />around you.
            </h1>

            <p className="text-ink-700 text-base sm:text-lg leading-relaxed mt-5 max-w-md">
              Turn complex environmental data into clear, personalized actions.
=======
              {t('landing.realtimeIntelligence')}
              <Sparkles size={12} className="text-forest-600" />
            </div>
 
            <h1
              className="text-reveal font-display text-4xl font-semibold leading-[1.06] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.6rem]"
            >
              {t('landing.heroTitlePart1')}
              <br />
              <span className="text-forest-700">{t('landing.heroTitlePart2')}</span>
            </h1>
 
            <p
              className="fade-up mt-5 max-w-md text-base leading-relaxed text-ink-700 sm:text-lg"
              style={{ animationDelay: '160ms' }}
            >
              {t('landing.heroDescription')}
>>>>>>> feature/frontend
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
<<<<<<< HEAD
                Explore Features
              </a>
            </div>
=======
                {t('landing.exploreFeatures')}
                <CompassIcon size={16} />
              </a>
            </div>

            <div
              className="fade-up mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-500"
              style={{ animationDelay: '360ms' }}
            >
              <span className="inline-flex items-center gap-2">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-600" />
                              {t('landing.liveEnvironmentalData')}
              </span>

              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={13} className="text-forest-600" />
                              {t('landing.clearRiskGuidance')}
              </span>

              <span className="inline-flex items-center gap-2">
                <Bell size={13} className="text-forest-600" />
                              {t('landing.locationAlerts')}
              </span>
            </div>
>>>>>>> feature/frontend
          </div>

          {/* LIVE AQI CARD */}
          <div className="animate-rise" style={{ animationDelay: '0.1s' }}>
            <div className="bg-surface rounded-xl2 shadow-lift border border-ink-100 p-6 sm:p-8 max-w-md mx-auto relative">

              {!loadingAQI && liveAQI !== null && (
                <div className="absolute top-6 right-6">
                  <RiskBadge aqi={liveAQI} size="sm" />
                </div>
              )}

              <div className="flex items-center gap-1.5 text-sm text-ink-700 mb-4">
                <MapPin size={15} className="text-forest-600" />
                {locationName}
              </div>

              {loadingAQI ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2
                    size={32}
                    className="text-forest-600 animate-spin"
                  />
                  <p className="text-sm text-ink-500 mt-3">
                    Getting live air quality...
                  </p>
                </div>
              ) : aqiError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin
                    size={30}
                    className="text-forest-600 mb-3"
                  />

                  <p className="font-semibold text-ink-800">
                    Location required
                  </p>

                  <p className="text-sm text-ink-500 mt-1 max-w-xs">
                    {aqiError}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center py-2">
                    <AQIGauge
                      aqi={liveAQI}
                      size={220}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">

                    <div className="bg-forest-50 rounded-lg px-4 py-3">
                      <p className="text-xs text-ink-500 font-medium">
                        PM2.5
                      </p>

                      <p className="font-mono font-semibold text-lg text-ink-900">
                        {livePM25 ?? '—'}{' '}
                        <span className="text-xs font-normal text-ink-500">
                          µg/m³
                        </span>
                      </p>
                    </div>

                    <div className="bg-forest-50 rounded-lg px-4 py-3">
                      <p className="text-xs text-ink-500 font-medium">
                        PM10
                      </p>

                      <p className="font-mono font-semibold text-lg text-ink-900">
                        {livePM10 ?? '—'}{' '}
                        <span className="text-xs font-normal text-ink-500">
                          µg/m³
                        </span>
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center gap-2 text-xs text-forest-700 mt-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
                    Live air quality data
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24 scroll-mt-16"
      >
        <div className="max-w-xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-700 mb-3">
            Features
          </p>

          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-ink-900 tracking-tight">
            Everything you need to understand your air
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

<<<<<<< HEAD
                <h3 className="font-display font-semibold text-ink-900 mb-1.5">
                  {f.title}
                </h3>

                <p className="text-sm text-ink-700 leading-relaxed">
                  {f.description}
=======
                <h3 className="font-display mb-1.5 font-semibold text-ink-900">
                {t(f.titleKey || 'features.' + f.key + '.title', { defaultValue: f.title })}
                </h3>

                <p className="text-sm leading-relaxed text-ink-700">
                {t(f.descriptionKey || 'features.' + f.key + '.description', { defaultValue: f.description })}
>>>>>>> feature/frontend
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
              How It Works
            </p>

            <h2 className="font-display font-semibold text-3xl sm:text-4xl text-ink-900 tracking-tight">
              From location to action, in four steps
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

<<<<<<< HEAD
                <h3 className="font-display font-semibold text-ink-900 mb-1.5">
                  {s.title}
                </h3>

                <p className="text-sm text-ink-700 leading-relaxed">
                  {s.description}
=======
                <h3 className="font-display mb-1.5 mt-4 font-semibold text-ink-900">
                {t(s.titleKey || ('howItWorks.step' + s.step + '.title'), { defaultValue: s.title })}
                </h3>

                <p className="text-sm leading-relaxed text-ink-700">
                {t(s.descriptionKey || ('howItWorks.step' + s.step + '.description'), { defaultValue: s.description })}
>>>>>>> feature/frontend
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
              Built for people who breathe the same air every day.
            </h2>

            <p className="text-forest-100/90 mt-4 max-w-md mx-auto leading-relaxed">
              AirGuard was built as a hackathon project to make environmental risk personal, clear, and actionable.
            </p>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-forest-800 font-semibold text-sm px-5 py-3.5 rounded-lg mt-8 hover:bg-forest-50 transition-colors"
            >
              Check Air Quality
              <ArrowRight size={16} />
            </Link>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}