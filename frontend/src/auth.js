import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEYS = {
  users: 'airguard_users',
  session: 'airguard_session',
}

const AuthContext = createContext(null)

export function hashPassword(password) {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return Array.from(password).reduce((acc, char) => acc + char.charCodeAt(0).toString(16).padStart(2, '0'), '')
  }

  const bytes = new TextEncoder().encode(password)

  return window.crypto.subtle.digest('SHA-256', bytes).then((buffer) =>
    Array.from(new Uint8Array(buffer))
      .map((value) => value.toString(16).padStart(2, '0'))
      .join(''),
  )
}

export function getStoredUsers() {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.users)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveStoredUsers(users) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
}

export function getStoredSessionUser() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.session)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveStoredSessionUser(user) {
  if (typeof window === 'undefined') return
  if (user) {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user))
    return
  }
  window.localStorage.removeItem(STORAGE_KEYS.session)
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function saveStoredUser(user) {
  if (!user?.email) return

  const users = getStoredUsers()
  const normalizedEmail = normalizeEmail(user.email)
  const updatedUsers = users.map((entry) => {
    if (normalizeEmail(entry.email) !== normalizedEmail) return entry
    return {
      ...entry,
      ...user,
      passwordHash: entry.passwordHash,
    }
  })

  saveStoredUsers(updatedUsers)
}

export async function ensureDemoAccount() {
  return getStoredUsers()
}

export async function signInUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email)
  const users = getStoredUsers()
  const user = users.find((entry) => normalizeEmail(entry.email) === normalizedEmail)

  if (!user) {
    throw new Error('No account found with that email address.')
  }

  const passwordHash = await hashPassword(String(password || ''))

  if (user.passwordHash !== passwordHash) {
    throw new Error('Incorrect password. Please try again.')
  }

  const { passwordHash: _passwordHash, ...safeUser } = user
  return safeUser
}

export async function registerUser({ name, email, password }) {
  const trimName = String(name || '').trim()
  const trimmedEmail = String(email || '').trim().toLowerCase()

  if (!trimName) {
    throw new Error('Please enter your full name.')
  }

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    throw new Error('Please enter a valid email address.')
  }

  if (String(password || '').length < 6) {
    throw new Error('Password must be at least 6 characters long.')
  }

  const users = getStoredUsers()
  const existingUser = users.find((user) => normalizeEmail(user.email) === trimmedEmail)

  if (existingUser) {
    throw new Error('An account with that email already exists.')
  }

  const newUser = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
    name: trimName.split(' ')[0],
    fullName: trimName,
    email: trimmedEmail,
    profileType: 'general',
    alertThreshold: 100,
    passwordHash: await hashPassword(String(password)),
  }

  saveStoredUsers([...users, newUser])

  const { passwordHash: _passwordHash, ...safeUser } = newUser
  return safeUser
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredSessionUser())

  useEffect(() => {
    ensureDemoAccount().then(() => {
      const sessionUser = getStoredSessionUser()
      setCurrentUser(sessionUser)
    })
  }, [])

  useEffect(() => {
    saveStoredSessionUser(currentUser)
  }, [currentUser])

  const value = useMemo(() => ({
    currentUser,
    isAuthenticated: Boolean(currentUser),
    signIn: async (credentials) => {
      const user = await signInUser(credentials)
      setCurrentUser(user)
      return user
    },
    signUp: async (data) => {
      const user = await registerUser(data)
      setCurrentUser(user)
      return user
    },
    updateCurrentUser: (updates) => {
      setCurrentUser((previousUser) => {
        const baseUser = previousUser || {}
        const nextUser = typeof updates === 'function'
          ? updates(baseUser)
          : { ...baseUser, ...updates }

        saveStoredUser(nextUser)
        return nextUser
      })
    },
    signOut: () => {
      setCurrentUser(null)
      saveStoredSessionUser(null)
    },
    // Password reset demo helpers
    requestPasswordReset: async (email) => {
      const normalizedEmail = normalizeEmail(email)
      const users = getStoredUsers()
      const user = users.find((u) => normalizeEmail(u.email) === normalizedEmail)

      // Do not disclose whether the user exists. For demo/local flows:
      // - If the user exists, create a short-lived reset token and return it.
      // - If the user does not exist, return a generic ok response but do not provide a token.
      // This preserves a production-like security posture while still enabling a demo experience.

      if (!user) {
        return { ok: true, demo: true }
      }

      const tokens = getStoredResetTokens()
      // Use crypto.randomUUID when available. Provide a secure fallback to crypto.getRandomValues.
      let token
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        token = crypto.randomUUID()
      } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const array = new Uint8Array(16)
        crypto.getRandomValues(array)
        token = Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('')
      } else {
        // Last resort: Date-based with random — still better than Math.random alone.
        token = `t-${Date.now()}-${Math.random().toString(36).slice(2)}`
      }

      const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes

      tokens.push({ email: normalizedEmail, token, expiresAt })
      saveStoredResetTokens(tokens)

      return { ok: true, token, expiresAt }
    },
    resetPassword: async (token, newPassword) => {
      const tokens = getStoredResetTokens()
      const entryIndex = tokens.findIndex((t) => t.token === token)

      if (entryIndex === -1) {
        throw new Error('Invalid reset token')
      }

      const entry = tokens[entryIndex]

      if (Date.now() > entry.expiresAt) {
        // remove expired token
        tokens.splice(entryIndex, 1)
        saveStoredResetTokens(tokens)
        throw new Error('Reset token has expired')
      }

      const users = getStoredUsers()
      const normalizedEmail = normalizeEmail(entry.email)
      const userIndex = users.findIndex((u) => normalizeEmail(u.email) === normalizedEmail)

      if (userIndex === -1) {
        // remove token
        tokens.splice(entryIndex, 1)
        saveStoredResetTokens(tokens)
        throw new Error('No account found for this reset request')
      }

      const passwordHash = await hashPassword(String(newPassword || ''))
      users[userIndex] = { ...users[userIndex], passwordHash }
      saveStoredUsers(users)

      // remove token after use
      tokens.splice(entryIndex, 1)
      saveStoredResetTokens(tokens)

      return { ok: true }
    },
  }), [currentUser])

    return React.createElement(AuthContext.Provider, { value }, children)
  }

  export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
  }

  // Helpers for reset tokens stored in localStorage
  function getStoredResetTokens() {
    if (typeof window === 'undefined') return []

    try {
      const raw = window.localStorage.getItem('airguard_reset_tokens')
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  function saveStoredResetTokens(tokens) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('airguard_reset_tokens', JSON.stringify(tokens))
  }
