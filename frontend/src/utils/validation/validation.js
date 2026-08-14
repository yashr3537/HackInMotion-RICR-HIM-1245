export function validateEmail(email) {
  const normalized = String(email || '').trim().toLowerCase()
  if (!normalized) return 'Email address is required.'
  const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  if (!re.test(normalized)) return 'Please enter a valid email address.'
  return null
}

export function validatePassword(password) {
  const str = String(password || '')
  if (!str) return 'Password is required.'
  if (str.length < 6) return 'Password must be at least 6 characters long.'
  return null
}

export function validateFullName(name) {
  const str = String(name || '').trim()
  if (!str) return 'Full name is required.'
  return null
}
