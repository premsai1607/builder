const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PAN = /^[A-Z]{5}\d{4}[A-Z]$/

export function emailError(value: string) {
  const email = value.trim()
  if (!email) return 'Enter an email address.'
  if (!EMAIL.test(email)) return 'Enter a valid email address.'
  return null
}

export function phoneError(value: string) {
  if (!/^\d{10}$/.test(value)) return 'Enter a 10-digit mobile number.'
  return null
}

export function panError(value: string) {
  const pan = value.trim().toUpperCase()
  if (!pan) return 'Enter a PAN, like ABCDE1234F.'
  if (!PAN.test(pan)) return 'Use the PAN format ABCDE1234F.'
  return null
}

export function aadhaarError(value: string) {
  if (!/^\d{12}$/.test(value)) return 'Enter a 12-digit Aadhaar number.'
  return null
}

export function isEmailValid(value: string) {
  return EMAIL.test(value.trim())
}

export function isPhoneValid(value: string) {
  return /^\d{10}$/.test(value)
}

export function isPanValid(value: string) {
  return PAN.test(value.trim().toUpperCase())
}

export function isAadhaarValid(value: string) {
  return /^\d{12}$/.test(value)
}
