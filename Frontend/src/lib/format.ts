export function formatInr(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)
}

export function parseDigits(value: string) {
  const digits = value.replace(/[^\d]/g, '')
  if (!digits) return null
  return Number(digits)
}

export function formatDate(iso: string) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 10) return value
  return `${digits.slice(0, 5)} ${digits.slice(5)}`
}

export function maskPan(value: string) {
  if (!value) return ''
  if (value.length < 6) return '••••••••••'
  return `${value.slice(0, 5)}••••${value.slice(-1)}`
}

export function maskAadhaar(value: string) {
  if (!value) return ''
  return `•••• •••• ${value.slice(-4)}`
}

export function maskAccount(value: string) {
  if (!value) return ''
  return `•••• ${value.slice(-4)}`
}

export function maskSalary() {
  return '₹ ••••••'
}
