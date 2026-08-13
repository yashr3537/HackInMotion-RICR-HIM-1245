import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Activity,
  Gauge,
  Compass as CompassIcon,
  TrendingUp,
  Bell,
  Footprints,
  ShieldCheck,
  MapPin,
  Sparkles,
} from 'lucide-react'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RiskBadge from '../components/RiskBadge'
import AQIGauge from '../components/AQIGauge'
import { features, howItWorks, currentLocation } from '../data/demoData'
import { useLanguage } from '../i18n/index.jsx'

const FEATURE_ICONS = {
  activity: Activity,
  gauge: Gauge,
  compass: CompassIcon,
  trending: TrendingUp,
  bell: Bell,
  footprints: Footprints,
}

const delayStyles = {
  delay1: { animationDelay: '80ms' },
  delay2: { animationDelay: '160ms' },
  delay3: { animationDelay: '240ms' },
  delay4: { animationDelay: '320ms' },
  delay5: { animationDelay: '400ms' },
}

export default function Landing() {
  const { t } = useLanguage()

  return (
    <div className="bg-canvas min-h-screen overflow-x-hidden">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="ambient-glow absolute inset-0" />

          <div className="absolute left-[7%] top-16 h-2 w-2 rounded-full bg-forest-400/60 float-soft" />

          <div
            className="absolute left-[20%] top-32 h-1.5 w-1.5 rounded-full bg-mist-500/50 float-gentle"
            style={delayStyles.delay2}
          />

          <div
            className="absolute right-[18%] top-20 h-2.5 w-2.5 rounded-full bg-forest-300/50 float-slow"
            style={delayStyles.delay3}
          />

          <div
            className="absolute right-[29%] top-56 h-1.5 w-1.5 rounded-full bg-forest-400/40 float-soft"
            style={delayStyles.delay1}
          />

          <div
            className="absolute bottom-24 left-[38%] h-2 w-2 rounded-full bg-mist-500/40 float-gentle"
            style={delayStyles.delay4}
          />

          <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-forest-400/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-2 lg:pb-28 lg:pt-24">
          {/* Hero content */}
          <div className="max-w-2xl">
            <div className="fade-down mb-6 inline-flex items-center gap-2 rounded-full border border-forest-200/70 bg-forest-50 px-3.5 py-1.5 text-xs font-semibold text-forest-800 shadow-sm">
              <ShieldCheck size={13} />
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
            </p>

            <div
              className="stagger-children mt-8 flex flex-wrap gap-3"
              style={{ animationDelay: '240ms' }}
            >
              <Link
                to="/dashboard"
                className="btn-premium inline-flex items-center gap-2 rounded-lg bg-forest-700 px-5 py-3.5 text-sm font-semibold text-white shadow-lift hover:bg-forest-800"
              >
                {t('landing.checkAirQuality')}
                <ArrowRight size={16} />
              </Link>

              <a
                href="#features"
                className="btn-premium inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-surface px-5 py-3.5 text-sm font-semibold text-ink-900 hover:border-forest-400"
              >
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
          </div>

          {/* Hero AQI Card */}
          <div
            className="scale-in relative mx-auto w-full max-w-md"
            style={{ animationDelay: '120ms' }}
          >
            <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-forest-400/8 blur-3xl" />

            <div className="card-hover card-glow relative rounded-xl2 border border-ink-100 bg-surface p-6 shadow-lift sm:p-8">
              {/* Card top */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500">
                    Live air quality
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-ink-700">
                    <MapPin size={15} className="text-forest-600" />
                    {currentLocation.name}
                  </div>
                </div>

                <RiskBadge
                  aqi={currentLocation.aqi}
                  size="sm"
                />
              </div>

              {/* AQI gauge */}
              <div className="flex justify-center py-2 float-soft">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-4 rounded-full bg-forest-400/8 blur-2xl aqi-pulse" />

                  <div className="relative">
                    <AQIGauge
                      aqi={currentLocation.aqi}
                      size={220}
                    />
                  </div>
                </div>
              </div>

              {/* Pollutants */}
              <div className="stagger-children mt-4 grid grid-cols-2 gap-3">
                <div className="card-hover rounded-lg border border-forest-100 bg-forest-50 px-4 py-3">
                  <p className="text-xs font-medium text-ink-500">
                    PM2.5
                  </p>

                  <p className="mt-0.5 font-mono text-lg font-semibold text-ink-900">
                    {currentLocation.pm25}{' '}
                    <span className="text-xs font-normal text-ink-500">
                      µg/m³
                    </span>
                  </p>
                </div>

                <div className="card-hover rounded-lg border border-forest-100 bg-forest-50 px-4 py-3">
                  <p className="text-xs font-medium text-ink-500">
                    PM10
                  </p>

                  <p className="mt-0.5 font-mono text-lg font-semibold text-ink-900">
                    {currentLocation.pm10}{' '}
                    <span className="text-xs font-normal text-ink-500">
                      µg/m³
                    </span>
                  </p>
                </div>
              </div>

              {/* Card footer */}
              <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
                <span className="text-xs text-ink-500">
                  Environmental status
                </span>

                <span className="inline-flex items-center gap-2 text-xs font-medium text-forest-700">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-forest-600" />
                  Live monitoring
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ====================================================== */}
      <section
        id="features"
        className="scroll-mt-16 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="fade-up mb-12 max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-forest-700">
            Features
          </p>

          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Everything you need to understand your air
          </h2>

          <p className="mt-4 text-sm leading-6 text-ink-600 sm:text-base">
            From live environmental conditions to historical trends and
            personalized guidance, AeroGuard keeps the information simple and
            useful.
          </p>
        </div>

        <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = FEATURE_ICONS[f.icon] || Activity

            return (
              <div
                key={f.key}
                className="card-hover card-glow group rounded-xl2 border border-ink-100 bg-surface p-6"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-forest-100 transition-transform duration-300 group-hover:scale-105">
                  <Icon
                    size={20}
                    className="text-forest-700 transition-transform duration-300 group-hover:rotate-[-4deg]"
                  />
                </div>

                <h3 className="font-display mb-1.5 font-semibold text-ink-900">
                {t(f.titleKey || 'features.' + f.key + '.title', { defaultValue: f.title })}
                </h3>

                <p className="text-sm leading-relaxed text-ink-700">
                {t(f.descriptionKey || 'features.' + f.key + '.description', { defaultValue: f.description })}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-medium text-forest-700 opacity-70 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  Explore capability
                  <ArrowRight size={13} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}
      <section
        id="how-it-works"
        className="scroll-mt-16 bg-forest-50/60 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="fade-up mb-14 max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-forest-700">
              How It Works
            </p>

            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              From location to action, in four steps
            </h2>
          </div>

          <div className="stagger-children relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {howItWorks.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="flex items-center gap-3">
                  <div className="card-hover flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-700 font-display font-semibold text-white shadow-sm">
                    {s.step}
                  </div>

                  {i < howItWorks.length - 1 && (
                    <div className="hidden h-px flex-1 bg-forest-200 lg:block" />
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

      {/* =====================================================
          PREMIUM ABOUT / CTA
      ====================================================== */}
      <section
        id="about"
        className="scroll-mt-16 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="card-glow relative overflow-hidden rounded-xl2 bg-gradient-to-br from-forest-900 to-forest-700 px-6 py-14 text-center sm:px-14 sm:py-16">
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-forest-500/20 blur-3xl float-slow" />

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-mist-300/10 blur-3xl float-gentle" />

          <div className="relative">
            <div className="fade-up mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-forest-100">
              <ShieldCheck size={13} />
              Environmental awareness, made personal
            </div>

            <h2 className="text-reveal mx-auto max-w-xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built for people who breathe the same air every day.
            </h2>

            <p className="fade-up mx-auto mt-4 max-w-md leading-relaxed text-forest-100/90">
              AeroGuard was built as a hackathon project to make environmental
              risk personal, clear, and actionable.
            </p>

            <Link
              to="/dashboard"
              className="btn-premium mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3.5 text-sm font-semibold text-forest-800 hover:bg-forest-50"
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