import { useCallback, useState } from 'react'
import { readJson, writeJson, STORAGE_KEYS } from '../services/storage/storageService'
import { createPlayerProfile } from '../utils/dataModels'
import { hasPlayerProfile } from '../utils/player'

export function usePlayerProfile() {
  const [profile, setProfile] = useState(() => {
    const stored = readJson(STORAGE_KEYS.PROFILE, null)
    return createPlayerProfile(stored ?? {})
  })

  const saveProfile = useCallback((updates) => {
    setProfile((current) => {
      const nextProfile = createPlayerProfile({ ...current, ...updates })
      writeJson(STORAGE_KEYS.PROFILE, nextProfile)
      return nextProfile
    })
  }, [])

  return {
    profile,
    saveProfile,
    hasProfile: hasPlayerProfile(profile),
  }
}
