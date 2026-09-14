const STORAGE_PREFIX = 'scout-tt'

export const STORAGE_VERSION = 1

export const STORAGE_KEYS = {
  RIVALS: 'rivals',
  MATCHES: 'matches',
  TEAMMATES: 'teammates',
  TOURNAMENTS: 'tournaments',
  TRAININGS: 'trainings',
  TRAINING_PROGRESS: 'training-progress',
  PROFILE: 'profile',
  META: 'meta',
  PENDING_SYNC: 'pending-sync',
}

let remoteWriter = null

function getStorageKey(key) {
  return `${STORAGE_PREFIX}:${key}`
}

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  return window.localStorage
}

export function registerRemoteWriter(writer) {
  remoteWriter = writer
}

export function readJson(key, fallback) {
  const storage = getStorage()

  if (!storage) {
    return fallback
  }

  try {
    const rawValue = storage.getItem(getStorageKey(key))

    if (rawValue == null) {
      return fallback
    }

    return JSON.parse(rawValue)
  } catch {
    return fallback
  }
}

export function writeLocalJson(key, value) {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    storage.setItem(getStorageKey(key), JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function writeJson(key, value) {
  const wrote = writeLocalJson(key, value)

  if (wrote && key !== STORAGE_KEYS.PENDING_SYNC) {
    remoteWriter?.(key, value)
  }

  return wrote
}

export function ensureStorageVersion() {
  const stored = readJson(STORAGE_KEYS.META, null)

  if (stored?.version === STORAGE_VERSION) {
    return
  }

  writeJson(STORAGE_KEYS.META, { version: STORAGE_VERSION })
}

export function removeJson(key) {
  const storage = getStorage()

  if (!storage) {
    return
  }

  storage.removeItem(getStorageKey(key))
}
