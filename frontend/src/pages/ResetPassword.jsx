import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'

export default function ResetPassword() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const { resetPassword } = useAuth()

  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null) // null|submitting|success

  useEffect(() => {
    // Read token from URL or sessionStorage so refresh works during the session
    const urlToken = query.get('token') || ''
    const sessionToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('airguard_reset_token') : null
    const effectiveToken = urlToken || sessionToken || ''

    if (urlToken) {
      // Store token temporarily and remove it from the visible URL to avoid leaking it in history
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('airguard_reset_token', urlToken)
        }
        // remove token from URL
        navigate(location.pathname, { replace: true })
      } catch (e) {
        // ignore sessionStorage/navigation errors
      }
    }

    setToken(effectiveToken)
  }, [location.search, navigate, location.pathname])

  function validate() {
    if (!token) return t('auth.invalidResetToken')
    if (!password) return t('auth.passwordRequired')
    if (password.length < 6) return t('auth.passwordTooShort')
    if (password !== confirmPassword) return t('auth.passwordsDoNotMatch')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    try {
      setStatus('submitting')
      await resetPassword(token, password)
      setStatus('success')
      // Clear stored token after successful reset
      try { if (typeof window !== 'undefined') window.sessionStorage.removeItem('airguard_reset_token') } catch (e) {}
    } catch (err) {
      // Map known backend/demo errors to friendly translated messages
      const msg = String(err?.message || '')
      if (msg.toLowerCase().includes('invalid')) {
        setError(t('auth.invalidResetToken'))
      } else if (msg.toLowerCase().includes('expired')) {
        setError(t('auth.resetTokenExpired'))
      } else if (msg.toLowerCase().includes('no account') || msg.toLowerCase().includes('not found')) {
        setError(t('auth.resetFailed'))
      } else {
        setError(t('auth.resetFailed'))
      }

      setStatus(null)
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-canvas">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-forest-700" />
            <h2 className="mt-6 text-2xl font-semibold text-ink-900">{t('auth.passwordUpdated')}</h2>
            <p className="mt-2 text-sm text-ink-600">{t('auth.passwordResetSuccess')}</p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-ink-100 shadow-soft text-center">
            <Link to="/login" className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-forest-800">{t('auth.backToSignIn')}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-canvas">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-ink-900">{t('auth.resetPassword')}</h2>
          <p className="mt-2 text-center text-sm text-ink-600">{t('auth.resetPasswordDescription')}</p>
        </div>

        <form className="mt-8 space-y-6 bg-surface p-6 rounded-2xl border border-ink-100 shadow-soft" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-ink-700">{t('auth.newPassword')}</label>
            <div className="mt-1 relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-3.5 py-3 text-sm text-ink-900 outline-none"
                placeholder={t('auth.newPasswordPlaceholder')}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-2 text-ink-500">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700">{t('auth.confirmNewPassword')}</label>
            <div className="mt-1 relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-3.5 py-3 text-sm text-ink-900 outline-none"
                placeholder={t('auth.confirmNewPasswordPlaceholder')}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-2 top-2 text-ink-500">
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-700 flex items-start gap-2">
              <AlertCircle />
              <div>{error}</div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link to="/login" className="text-sm text-ink-600 hover:text-forest-700">{t('auth.backToSignIn')}</Link>
            <button type="submit" className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-forest-800">
              {t('auth.resetPassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
