import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Leaf,
  Mail,
  LockKeyhole,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Wind,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'
import LanguageSelector from '../components/LanguageSelector'

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function Login() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { isAuthenticated, signIn, signUp } = useAuth()

  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [verificationSent, setVerificationSent] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    setError('')
    setVerificationSent(null)

    setForm((current) => ({
      ...current,
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    }))

    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [mode])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    if (error) {
      setError('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setIsSubmitting(true)

      if (mode === 'signup') {
        if (!form.name.trim()) {
          throw new Error(t('auth.fullNameRequired', { defaultValue: 'Please enter your full name.' }))
        }

        if (!form.email.trim()) {
          throw new Error(t('auth.emailRequired', { defaultValue: 'Please enter your email address.' }))
        }

        if (form.password.length < 6) {
          throw new Error(t('auth.passwordTooShort', { defaultValue: 'Password must be at least 6 characters.' }))
        }

        if (form.password !== form.confirmPassword) {
          throw new Error(t('auth.passwordsDoNotMatch', { defaultValue: 'Passwords do not match.' }))
        }

        const result = await signUp({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        })

        if (result?.needsVerification || !result?.session) {
          setVerificationSent({ email: form.email.trim() })
          return
        }

        navigate('/dashboard', { replace: true })
      } else {
        if (!form.email.trim() || !form.password) {
          throw new Error(t('auth.credentialsRequired', { defaultValue: 'Please enter your email and password.' }))
        }

        await signIn({
          email: form.email.trim(),
          password: form.password,
        })

        navigate('/dashboard', { replace: true })
      }
    } catch (submitError) {
      setError(
        submitError?.message || t('auth.genericError', { defaultValue: 'Something went wrong while creating your account. Please try again later.' })
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordStrength = useMemo(() => {
    const password = form.password

    if (!password) {
      return { level: 0, label: '' }
    }

    if (password.length < 6) {
      return { level: 1, label: t('auth.tooShort', { defaultValue: 'Too short' }) }
    }

    if (
      password.length >= 10 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      return { level: 3, label: t('auth.strongPassword', { defaultValue: 'Strong password' }) }
    }

    return { level: 2, label: t('auth.goodPassword', { defaultValue: 'Good password' }) }
  }, [form.password, t])

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-canvas">
      {/* AMBIENT BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-forest-400/8 blur-[110px] float-slow" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-mist-400/6 blur-[120px] float-gentle" />
        <div className="environment-grid absolute inset-0 opacity-30" />
        <div className="absolute left-[14%] top-[18%] h-1.5 w-1.5 rounded-full bg-forest-500/50 float-soft" />
        <div className="absolute right-[18%] top-[26%] h-2 w-2 rounded-full bg-forest-400/40 float-slow" />
        <div className="absolute bottom-[22%] left-[24%] h-1.5 w-1.5 rounded-full bg-mist-500/40 float-gentle" />
      </div>

      {/* LEFT BRAND PANEL */}
      <div className="relative hidden w-[46%] flex-col overflow-hidden border-r border-ink-100 bg-forest-950 px-10 py-10 text-white lg:flex xl:px-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-forest-500/10 blur-3xl float-slow" />
          <div className="absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-mist-300/8 blur-3xl float-gentle" />
          <div className="environment-grid absolute inset-0 opacity-20" />
        </div>

        <Link to="/" className="nav-enter group relative z-10 flex w-fit shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-forest-300/10 bg-forest-500/10 transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2">
            <Leaf size={20} className="text-forest-300 transition-transform duration-300 group-hover:scale-110" />
          </div>

          <div>
            <div className="font-display text-lg font-semibold tracking-tight">AirGuard</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-forest-300/55">Environmental Safety</div>
          </div>
        </Link>

        <div className="relative z-10 max-w-lg mt-16 xl:mt-20 mb-12">
          <div className="fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-forest-300/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-200">
            <Sparkles size={12} />
            {t('auth.leftTag', { defaultValue: 'Environmental intelligence' })}
          </div>

          <h2 className="text-reveal font-display text-4xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
            {t('auth.leftTitlePart1', { defaultValue: 'See the air.' })}
            <br />
            <span className="text-forest-300">
              {t('auth.leftTitlePart2', { defaultValue: 'Understand the risk.' })}
            </span>
          </h2>

          <p className="fade-up mt-6 max-w-md text-sm leading-7 text-forest-100/60 xl:text-base" style={{ animationDelay: '140ms' }}>
            {t('auth.leftDesc', { defaultValue: 'Track the air around you, understand environmental risk, and make more informed decisions about the places and activities that matter to you.' })}
          </p>

          <div className="stagger-children mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-forest-100/70">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                <Wind size={15} className="text-forest-300" />
              </div>
              {t('auth.feature1', { defaultValue: 'Real-time environmental monitoring' })}
            </div>

            <div className="flex items-center gap-3 text-sm text-forest-100/70">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                <ShieldCheck size={15} className="text-forest-300" />
              </div>
              {t('auth.feature2', { defaultValue: 'Personalized risk guidance' })}
            </div>

            <div className="flex items-center gap-3 text-sm text-forest-100/70">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                <CheckCircle2 size={15} className="text-forest-300" />
              </div>
              {t('auth.feature3', { defaultValue: 'Alerts for the locations you care about' })}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto text-[10px] uppercase tracking-[0.14em] text-forest-300/35">
          {t('auth.leftFooter', { defaultValue: 'Environmental awareness, made actionable.' })}
        </div>
      </div>

      {/* AUTH PANEL */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        {/* Top-right Language Selector */}
        <div className="absolute top-5 right-6 z-20">
          <LanguageSelector compact />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Link to="/" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-800 transition-transform duration-300 group-hover:scale-105">
                <Leaf size={18} className="text-forest-300" />
              </div>
              <span className="font-display text-xl font-semibold text-ink-900">AirGuard</span>
            </Link>
          </div>

          {/* Card */}
          {verificationSent ? (
            <div className="scale-in">
              <div className="card-glow rounded-[28px] border border-forest-100 bg-surface p-6 shadow-card sm:p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-700">
                  <Mail size={28} />
                </div>

                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                  Account created successfully! 📧
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  We've sent a verification email to:
                </p>

                <div className="mt-2 inline-block rounded-xl border border-forest-200 bg-forest-50 px-4 py-2 text-sm font-semibold text-forest-800 break-all">
                  {verificationSent.email}
                </div>

                <p className="mt-4 text-xs leading-relaxed text-ink-600">
                  Please check your inbox and click the verification link to confirm your email address.
                </p>

                <div className="mt-6 rounded-2xl border border-ink-100 bg-ink-50/70 p-4 text-left">
                  <p className="text-xs font-semibold text-ink-800 mb-2">Didn't receive the email?</p>
                  <ul className="text-xs text-ink-600 space-y-1.5 list-disc list-inside">
                    <li>Check your <strong>Spam/Junk</strong> folder.</li>
                    <li>Make sure the email address is correct.</li>
                    <li>Try again after a few moments.</li>
                  </ul>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationSent(null)
                      setMode('signin')
                    }}
                    className="btn-premium w-full rounded-xl bg-forest-700 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="scale-in">
              <div className="card-glow rounded-[28px] border border-ink-100 bg-surface p-6 shadow-card sm:p-8">
                {/* Tabs */}
                <div className="mb-7 rounded-xl border border-ink-100 bg-ink-50 p-1">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                        mode === 'signin' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                      }`}
                    >
                      {t('auth.signInTab', { defaultValue: 'Sign in' })}
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                        mode === 'signup' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                      }`}
                    >
                      {t('auth.signUpTab', { defaultValue: 'Create account' })}
                    </button>
                  </div>
                </div>

                {/* Heading */}
                <div className="fade-up">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                    {mode === 'signin' ? <ShieldCheck size={18} /> : <Sparkles size={18} />}
                  </div>

                  <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                    {mode === 'signin'
                      ? t('auth.welcomeBack', { defaultValue: 'Welcome back' })
                      : t('auth.createYourAccount', { defaultValue: 'Create your account' })}
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-ink-500">
                    {mode === 'signin'
                      ? t('auth.signInSubtitle', { defaultValue: 'Sign in to access your personalized environmental dashboard.' })
                      : t('auth.signUpSubtitle', { defaultValue: 'Set up your profile to receive more relevant environmental guidance.' })}
                  </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
                  {/* Name */}
                  {mode === 'signup' && (
                    <div className="fade-up">
                      <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-ink-700">
                        {t('auth.fullName', { defaultValue: 'Full name' })}
                      </label>

                      <div className="search-premium relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder={t('auth.fullNamePlaceholder', { defaultValue: 'Your name' })}
                          className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-3.5 py-3 pl-10 text-sm text-ink-900 outline-none transition-all duration-300 placeholder:text-ink-400 focus:border-forest-400 focus:bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="fade-up">
                    <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink-700">
                      {t('auth.emailAddress', { defaultValue: 'Email address' })}
                    </label>

                    <div className="search-premium relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder={t('auth.emailPlaceholder', { defaultValue: 'you@example.com' })}
                        className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-3.5 py-3 pl-10 text-sm text-ink-900 outline-none transition-all duration-300 placeholder:text-ink-400 focus:border-forest-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="fade-up">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <label htmlFor="password" className="text-xs font-semibold text-ink-700">
                        {t('auth.passwordLabel', { defaultValue: 'Password' })}
                      </label>

                      {mode === 'signin' && (
                        <Link to="/forgot-password" className="text-[10px] font-semibold text-forest-700 hover:text-forest-800">
                          {t('auth.forgotPasswordLink', { defaultValue: 'Forgot password?' })}
                        </Link>
                      )}
                    </div>

                    <div className="search-premium relative">
                      <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-3.5 py-3 pl-10 pr-11 text-sm text-ink-900 outline-none transition-all duration-300 placeholder:text-ink-400 focus:border-forest-400 focus:bg-white"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="icon-hover absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Password strength */}
                    {mode === 'signup' && form.password && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((level) => (
                            <span
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                passwordStrength.level >= level
                                  ? level === 3
                                    ? 'bg-forest-600'
                                    : 'bg-forest-400'
                                  : 'bg-ink-100'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-[10px] text-ink-400">{passwordStrength.label}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  {mode === 'signup' && (
                    <div className="fade-up">
                      <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold text-ink-700">
                        {t('auth.confirmPasswordLabel', { defaultValue: 'Confirm password' })}
                      </label>

                      <div className="search-premium relative">
                        <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder={t('auth.confirmPasswordLabel', { defaultValue: 'Confirm password' })}
                          className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-3.5 py-3 pl-10 pr-11 text-sm text-ink-900 outline-none transition-all duration-300 placeholder:text-ink-400 focus:border-forest-400 focus:bg-white"
                        />

                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="icon-hover absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="notification-enter flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-premium mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        {mode === 'signup' ? 'Creating your account...' : t('auth.pleaseWait', { defaultValue: 'Please wait...' })}
                      </>
                    ) : (
                      <>
                        {mode === 'signin'
                          ? t('auth.signInButton', { defaultValue: 'Sign In' })
                          : t('auth.createAccountButton', { defaultValue: 'Create Account' })}
                        <ArrowRight size={15} className="transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </form>

                {/* Security note */}
                <div className="fade-up mt-6 flex items-start gap-2.5 rounded-xl border border-ink-100 bg-ink-50/60 px-3.5 py-3">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0 text-forest-700" />
                  <p className="text-[10px] leading-5 text-ink-500">
                    {t('auth.securityNote', { defaultValue: 'Your account settings and saved environmental locations are associated with your account.' })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Back home */}
          <div className="mt-5 text-center">
            <Link to="/" className="text-xs font-medium text-ink-500 transition-colors hover:text-forest-700">
              {t('auth.backToAirGuard', { defaultValue: '← Back to AirGuard' })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}