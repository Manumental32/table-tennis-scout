import { hasPlayerProfile } from '../../utils/player'
import { getSupabaseClient } from '../supabase/client'
import {
  STORAGE_KEYS,
  readJson,
  writeLocalJson,
} from './storageService'

const STORE_TABLE = 'user_store'

const LIST_KEYS = [
  STORAGE_KEYS.RIVALS,
  STORAGE_KEYS.MATCHES,
  STORAGE_KEYS.TEAMMATES,
  STORAGE_KEYS.TOURNAMENTS,
]

const DOCUMENT_KEYS = [STORAGE_KEYS.PROFILE, STORAGE_KEYS.META]

const SYNCABLE_KEYS = [...LIST_KEYS, ...DOCUMENT_KEYS]

let activeUserId = null
let syncPaused = false

export function setActiveUserId(userId) {
  activeUserId = userId ?? null
}

export function getActiveUserId() {
  return activeUserId
}

export function pauseRemoteSync() {
  syncPaused = true
}

export function resumeRemoteSync() {
  syncPaused = false
}

export function canSyncRemote() {
  return Boolean(activeUserId) && !syncPaused
}

function mergeLists(localValue, remoteValue) {
  const localItems = Array.isArray(localValue) ? localValue : []
  const remoteItems = Array.isArray(remoteValue) ? remoteValue : []
  const merged = new Map()
  const extras = []

  for (const item of remoteItems) {
    if (item?.id) {
      merged.set(item.id, item)
    } else {
      extras.push(item)
    }
  }

  for (const item of localItems) {
    if (!item?.id) {
      extras.push(item)
      continue
    }

    if (!merged.has(item.id)) {
      merged.set(item.id, item)
    }
  }

  return [...merged.values(), ...extras]
}

function mergeProfile(localValue, remoteValue) {
  if (hasPlayerProfile(remoteValue)) {
    return { ...localValue, ...remoteValue }
  }

  if (hasPlayerProfile(localValue)) {
    return { ...remoteValue, ...localValue }
  }

  return remoteValue ?? localValue ?? null
}

function mergeDocument(key, localValue, remoteValue) {
  if (key === STORAGE_KEYS.PROFILE) {
    return mergeProfile(localValue, remoteValue)
  }

  return {
    ...(remoteValue && typeof remoteValue === 'object' ? remoteValue : {}),
    ...(localValue && typeof localValue === 'object' ? localValue : {}),
  }
}

function getPendingKeys() {
  const pending = readJson(STORAGE_KEYS.PENDING_SYNC, [])
  return Array.isArray(pending) ? pending : []
}

function setPendingKeys(keys) {
  writeLocalJson(STORAGE_KEYS.PENDING_SYNC, keys)
}

export function markPendingSync(key) {
  if (!SYNCABLE_KEYS.includes(key)) {
    return
  }

  const pending = getPendingKeys()

  if (!pending.includes(key)) {
    setPendingKeys([...pending, key])
  }
}

function clearPendingSync(key) {
  setPendingKeys(getPendingKeys().filter((item) => item !== key))
}

export async function upsertRemoteKey(key, value) {
  const client = getSupabaseClient()

  if (!client || !activeUserId || !SYNCABLE_KEYS.includes(key)) {
    return
  }

  const { error } = await client.from(STORE_TABLE).upsert(
    {
      user_id: activeUserId,
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,key' },
  )

  if (error) {
    markPendingSync(key)
    return false
  }

  clearPendingSync(key)
  return true
}

export async function flushPendingSync() {
  if (!canSyncRemote()) {
    return
  }

  for (const key of getPendingKeys()) {
    await upsertRemoteKey(key, readJson(key, key === STORAGE_KEYS.PROFILE ? null : []))
  }
}

let hydrateInFlight = null

export async function hydrateRemoteStore(userId) {
  if (hydrateInFlight) {
    return hydrateInFlight
  }

  hydrateInFlight = syncRemoteStore(userId).finally(() => {
    hydrateInFlight = null
  })

  return hydrateInFlight
}

async function syncRemoteStore(userId) {
  const client = getSupabaseClient()

  if (!client || !userId) {
    return
  }

  pauseRemoteSync()
  setActiveUserId(userId)

  try {
    const { data, error } = await client
      .from(STORE_TABLE)
      .select('key, value')
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    const remoteByKey = new Map((data ?? []).map((row) => [row.key, row.value]))
    const nextStore = {}

    for (const key of LIST_KEYS) {
      nextStore[key] = mergeLists(readJson(key, []), remoteByKey.get(key))
    }

    for (const key of DOCUMENT_KEYS) {
      nextStore[key] = mergeDocument(key, readJson(key, null), remoteByKey.get(key))
    }

    for (const key of SYNCABLE_KEYS) {
      writeLocalJson(key, nextStore[key])
    }

    for (const key of SYNCABLE_KEYS) {
      const saved = await upsertRemoteKey(key, nextStore[key])

      if (!saved) {
        throw new Error('No se pudo guardar el historial en la nube.')
      }
    }

    await flushPendingSync()
  } finally {
    resumeRemoteSync()
  }
}
