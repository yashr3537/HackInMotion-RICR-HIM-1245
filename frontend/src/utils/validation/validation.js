export function validateEmail(email) {
  const trimmed = String(email || '').trim().toLowerCase()
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address.' }
  }
  return { isValid: true, error: null, value: trimmed }
}

export function validatePassword(password) {
  const str = String(password || '')
  if (!str) {
    return { isValid: false, error: 'Password is required.' }
  }
  if (str.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' }
  }
  return { isValid: true, error: null, value: str }
}

export function validateFullName(name) {
  const trimmed = String(name || '').trim()
  if (!trimmed) {
    return { isValid: false, error: 'Full name is required.' }
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters.' }
  }
  return { isValid: true, error: null, value: trimmed }
}
