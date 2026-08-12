import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { currentUser as defaultUser } from './data/demoData'

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
  const users = getStoredUsers()
  const normalizedEmail = normalizeEmail(defaultUser.email)

  if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
    return users
  }

  const demoUser = {
    id: 'demo-user',
    name: defaultUser.name,
    fullName: defaultUser.fullName,
    email: defaultUser.email,
    profileType: defaultUser.profileType,
    alertThreshold: defaultUser.alertThreshold,
    passwordHash: await hashPassword('airguard123'),
  }

  saveStoredUsers([...users, demoUser])
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
    currentUser: currentUser || defaultUser,
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
        const nextUser = typeof updates === 'function'
          ? updates(previousUser || defaultUser)
          : { ...(previousUser || defaultUser), ...updates }

        saveStoredUser(nextUser)
        return nextUser
      })
    },
    signOut: () => {
      setCurrentUser(null)
      saveStoredSessionUser(null)
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
