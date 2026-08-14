import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'

export default function ForgotPassword() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { requestPasswordReset } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null) // null | sending | sent
  const [resetToken, setResetToken] = useState(null)

  function validateEmail(value) {
    if (!value) return t('auth.emailRequired')
    // basic email regex
    const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!re.test(value)) return t('auth.invalidEmail')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const validation = validateEmail(email.trim())
    if (validation) {
      setError(validation)
      return
    }

    try {
      setStatus('sending')
      const result = await requestPasswordReset(email.trim())

      // For production-like security, do not reveal whether the email exists.
      // The API returns ok:true in both cases; it only includes a token when the user exists.
      if (result.ok && result.token) {
        setResetToken(result.token)
        setStatus('sent')
        return
      }

      // Generic success for unknown users (demo-safe message). Do not provide a token/link.
      if (result.ok && !result.token) {
        setStatus('sent')
        setResetToken(null)
        return
      }

      // Fallback error
      setError(result.message || t('auth.resetRequestFailed'))
      setStatus(null)
    } catch (err) {
      setError(err.message || t('auth.resetRequestFailed'))
      setStatus(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-canvas">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-ink-900">{t('auth.forgotPassword')}</h2>
          <p className="mt-2 text-center text-sm text-ink-600">{t('auth.forgotPasswordDescription')}</p>
        </div>

        <form className="mt-8 space-y-6 bg-surface p-6 rounded-2xl border border-ink-100 shadow-soft" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700">{t('auth.emailAddress')}</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-3 text-ink-300" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-3.5 py-3 pl-10 text-sm text-ink-900 outline-none"
                placeholder={t('auth.emailPlaceholder')}
              />
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
             <button disabled={status === 'sending'} type="submit" className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-forest-800 disabled:opacity-50">
               {status === 'sending' ? t('auth.sending') : t('auth.sendResetLink')}
             </button>
          </div>

          {status === 'sent' && (
            <div className="mt-4 rounded-xl border border-forest-100 bg-forest-50 p-3 text-sm text-forest-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 />
                <div>
                  <div className="font-semibold">{t('auth.demoResetCreated')}</div>
                  <div className="mt-1 text-xs text-ink-600">{t('auth.demoResetNotice')}</div>
                  {resetToken ? (
                    <div className="mt-2 text-xs">
                      {/* For demo builds, provide a direct link to the reset page so the user can complete the flow locally */}
                      <Link to={`/reset-password?token=${resetToken}`} className="text-sm font-medium text-forest-700">{t('auth.openResetLink')}</Link>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-ink-600">{t('auth.demoResetNotice')}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
