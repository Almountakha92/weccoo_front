const ADMIN_TOKEN_KEY = 'weccoo_admin_token'

const readSessionStorageValue = (key: string) => {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

const setSessionStorageValue = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

const removeSessionStorageValue = (key: string) => {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export const setAdminToken = (token: string) => setSessionStorageValue(ADMIN_TOKEN_KEY, token)
export const getAdminToken = () => readSessionStorageValue(ADMIN_TOKEN_KEY)
export const clearAdminToken = () => removeSessionStorageValue(ADMIN_TOKEN_KEY)

export const getAdminAuthHeaders = () => {
  const token = getAdminToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const decodeJwtPayload = <T = any>(token: string): T | null => {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const decoded = atob(padded)
    return JSON.parse(decoded) as T
  } catch {
    return null
  }
}

