const browserDefaultApiUrl =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:4000/api`
    : 'http://localhost:4000/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? browserDefaultApiUrl
