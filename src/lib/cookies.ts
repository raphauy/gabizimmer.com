// Client-side cookie utilities

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

export function setCookie(name: string, value: string, maxAge: number = COOKIE_MAX_AGE) {
  if (typeof window === 'undefined') return
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`
}

export function deleteCookie(name: string) {
  if (typeof window === 'undefined') return
  document.cookie = `${name}=; path=/; max-age=0`
}