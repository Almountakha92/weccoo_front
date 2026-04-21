const browserDefaultApiUrl =
  typeof window !== 'undefined'
    ? ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? `${window.location.protocol}//${window.location.hostname}:4000/api`
      : `${window.location.origin}/api`
    : 'http://localhost:4000/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? browserDefaultApiUrl
