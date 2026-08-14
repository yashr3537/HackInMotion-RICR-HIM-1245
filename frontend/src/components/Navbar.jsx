import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Leaf, ArrowRight, LogIn, Sparkles } from 'lucide-react'
import LanguageSelector from './LanguageSelector.jsx'
import { useLanguage } from '../i18n/index.jsx'

const LINKS = [
  { href: '#features', key: 'features', label: 'Features' },
  { href: '#how-it-works', key: 'howItWorks', label: 'How It Works' },
  { href: '#about', key: 'about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleMobileLink = (href) => {
    setOpen(false)

    window.setTimeout(() => {
      const target = document.querySelector(href)

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    }, 50)
  }

  const { t } = useLanguage()

  return (
    <>
      <header
        className={`nav-enter fixed left-0 right-0 top-0 z-[100] border-b transition-all duration-300 ${
          scrolled
            ? 'border-ink-200/80 bg-canvas/92 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl'
            : 'border-ink-100 bg-canvas/80 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* BRAND */}
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3"
            aria-label="AirGuard home"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-forest-700/10 bg-forest-800 shadow-sm transition-all duration-300 group-hover:-rotate-3 group-hover:scale-105 group-hover:shadow-md">
              <span className="absolute inset-0 rounded-xl bg-forest-400/10 blur-md transition-opacity duration-300 group-hover:opacity-100" />

              <Leaf
                size={18}
                className="relative z-10 text-forest-300 transition-transform duration-300 group-hover:scale-110"
              />
            </span>

            <span className="hidden sm:block">
              <span className="block font-display text-lg font-semibold tracking-tight text-ink-900">
                AirGuard
              </span>

              <span className="block text-[9px] font-medium uppercase tracking-[0.2em] text-ink-500">
                Environmental Safety
              </span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-7 md:flex">
            <Link
              to="/"
              className="nav-item nav-underline text-sm font-medium text-ink-700 hover:text-forest-700"
            >
              {t('nav.home')}
            </Link>

            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-item nav-underline text-sm font-medium text-ink-700 hover:text-forest-700"
              >
                {t(`nav.${link.key}`) || link.label}
              </a>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-2.5 md:flex">
            <LanguageSelector compact />

            <Link
              to="/login"
              className="btn-premium inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-forest-700"
            >
              <LogIn size={15} />
              {t('auth.login')}
            </Link>

            <Link
              to="/dashboard"
              className="btn-premium group inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800"
            >
              <Sparkles
                size={14}
                className="transition-transform duration-300 group-hover:rotate-12"
              />

              {t('common.checkAirQuality')}

              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            type="button"
            className="icon-hover flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-surface text-ink-700 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`md:hidden overflow-hidden border-t border-ink-100 bg-canvas/95 backdrop-blur-xl transition-all duration-300 ${
            open ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
            <div className="stagger-children flex flex-col gap-1.5">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-forest-100 bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800"
              >
                {t('nav.home')}
              </Link>

              {LINKS.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleMobileLink(link.href)}
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-forest-700"
                >
                  {t(`nav.${link.key}`) || link.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="btn-premium inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800"
              >
                <LogIn size={15} />
                {t('auth.login')}
              </Link>

              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-4 py-3 text-sm font-semibold text-white"
              >
                {t('common.checkAirQuality')}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU BACKDROP */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
    </>
  )
}
