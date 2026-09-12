import { useCallback } from 'react'
import { STORAGE_KEYS } from '../services/storage/storageService'
import { createRival } from '../utils/dataModels'
import { usePersistedList } from './usePersistedList'

export function useRivals() {
  const { items, addItem, updateItem, removeItem } = usePersistedList(
    STORAGE_KEYS.RIVALS,
  )

  const addRival = useCallback(
    (input = {}) => {
      const rival = createRival(input)
      addItem(rival)
      return rival
    },
    [addItem],
  )

  const updateRival = useCallback(
    (id, updates) => {
      updateItem(id, updates)
    },
    [updateItem],
  )

  const getRivalById = useCallback(
    (id) => items.find((rival) => rival.id === id) ?? null,
    [items],
  )

  return {
    rivals: items,
    addRival,
    updateRival,
    removeRival: removeItem,
    getRivalById,
  }
}
