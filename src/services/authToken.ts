const AUTH_TOKEN_KEY = 'students_auth_token'
const AUTH_USER_KEY = 'students_auth_user'

export interface AuthUserSession {
  id: string
  fullName: string
  email: string
  university: string
  whatsappPhone: string
  campusId?: string | null
}

const readLegacyLocalStorageValue = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const removeLegacyLocalStorageValue = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

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

export const setAuthToken = (token: string) => {
  setSessionStorageValue(AUTH_TOKEN_KEY, token)
}

export const getAuthToken = () => {
  const token = readSessionStorageValue(AUTH_TOKEN_KEY)
  if (token) return token

  // Cleanup: previously stored in localStorage (persistent). We don't want that anymore.
  const legacyToken = readLegacyLocalStorageValue(AUTH_TOKEN_KEY)
  if (legacyToken) {
    removeLegacyLocalStorageValue(AUTH_TOKEN_KEY)
  }

  return null
}

export const clearAuthToken = () => {
  removeSessionStorageValue(AUTH_TOKEN_KEY)
  removeLegacyLocalStorageValue(AUTH_TOKEN_KEY)
}

export const setAuthUser = (user: AuthUserSession) => {
  setSessionStorageValue(AUTH_USER_KEY, JSON.stringify(user))
}

export const getAuthUser = (): AuthUserSession | null => {
  const serializedUser = readSessionStorageValue(AUTH_USER_KEY)

  if (!serializedUser) {
    // Cleanup legacy persistent storage
    const legacyUser = readLegacyLocalStorageValue(AUTH_USER_KEY)
    if (legacyUser) {
      removeLegacyLocalStorageValue(AUTH_USER_KEY)
    }

    return null
  }

  try {
    return JSON.parse(serializedUser) as AuthUserSession
  } catch {
    removeSessionStorageValue(AUTH_USER_KEY)
    return null
  }
}

export const clearAuthUser = () => {
  removeSessionStorageValue(AUTH_USER_KEY)
  removeLegacyLocalStorageValue(AUTH_USER_KEY)
}

export const clearAuthSession = () => {
  clearAuthToken()
  clearAuthUser()
}
