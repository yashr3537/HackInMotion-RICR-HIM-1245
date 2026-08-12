import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { useAuth } from '../auth'

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function Login() {
  const navigate = useNavigate()
  const { isAuthenticated, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setIsSubmitting(true)

      if (mode === 'signup') {
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match.')
        }

        await signUp({
          name: form.name,
          email: form.email,
          password: form.password,
        })
      } else {
        await signIn({
          email: form.email,
          password: form.password,
        })
      }

      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="w-9 h-9 rounded-lg bg-forest-800 flex items-center justify-center">
            <Leaf size={17} className="text-forest-300" />
          </span>
          <span className="font-display font-semibold text-xl text-ink-900">AirGuard</span>
        </Link>

        <div className="bg-surface rounded-xl2 border border-ink-100 shadow-card p-7 sm:p-8">
          <div className="grid grid-cols-2 rounded-lg bg-ink-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${mode === 'signin' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}
            >
              Create account
            </button>
          </div>

          <h1 className="font-display font-semibold text-xl text-ink-900 mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-ink-500 mb-6">
            {mode === 'signin'
              ? 'Sign in to access your personalized dashboard.'
              : 'Set up your account to start tracking air quality.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-ink-700 mb-1.5 block">Full name</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full bg-ink-100/70 border border-transparent focus:border-forest-400 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-ink-700 mb-1.5 block">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-ink-100/70 border border-transparent focus:border-forest-400 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-700 mb-1.5 block">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-ink-100/70 border border-transparent focus:border-forest-400 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-ink-700 mb-1.5 block">Confirm password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full bg-ink-100/70 border border-transparent focus:border-forest-400 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-forest-700 hover:bg-forest-800 disabled:opacity-70 text-white font-semibold text-sm py-3 rounded-lg transition-colors mt-2"
            >
              {isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-500 mt-6">
          Demo login: <span className="font-medium text-ink-700">yogesh.sharma@example.com</span> / <span className="font-medium text-ink-700">airguard123</span>
        </p>
      </div>
    </div>
  )
}
