const STORAGE_KEY = 'scout-tt:dev-skip-auth'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export const DEV_LOCAL_USER = {
  id: 'local-dev',
  email: 'local@localhost',
}

function getStorage() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null
  }

  return window.sessionStorage
}

export function isLocalDevHost() {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return false
  }

  return LOCAL_HOSTS.has(window.location.hostname)
}

export function readDevSkip() {
  if (!isLocalDevHost()) {
    return false
  }

  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    return storage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeDevSkip(enabled) {
  if (!isLocalDevHost()) {
    return
  }

  const storage = getStorage()

  if (!storage) {
    return
  }

  try {
    if (enabled) {
      storage.setItem(STORAGE_KEY, '1')
    } else {
      storage.removeItem(STORAGE_KEY)
    }
  } catch {
    return
  }
}

export function createDevSession() {
  return {
    user: DEV_LOCAL_USER,
    isDevSkip: true,
  }
}
