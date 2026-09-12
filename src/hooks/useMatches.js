import { useCallback } from 'react'
import { STORAGE_KEYS } from '../services/storage/storageService'
import { createMatch } from '../utils/dataModels'
import { usePersistedList } from './usePersistedList'

export function useMatches() {
  const { items, addItem, updateItem, removeItem } = usePersistedList(
    STORAGE_KEYS.MATCHES,
  )

  const addMatch = useCallback(
    (input = {}) => {
      const match = createMatch(input)
      addItem(match)
      return match
    },
    [addItem],
  )

  const updateMatch = useCallback(
    (id, updates) => {
      updateItem(id, updates)
    },
    [updateItem],
  )

  const getMatchById = useCallback(
    (id) => items.find((match) => match.id === id) ?? null,
    [items],
  )

  return {
    matches: items,
    addMatch,
    updateMatch,
    removeMatch: removeItem,
    getMatchById,
  }
}
