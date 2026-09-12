import { useCallback } from 'react'
import { STORAGE_KEYS } from '../services/storage/storageService'
import { createTeammate } from '../utils/dataModels'
import { usePersistedList } from './usePersistedList'

export function useTeammates() {
  const { items, addItem, updateItem, removeItem } = usePersistedList(
    STORAGE_KEYS.TEAMMATES,
  )

  const addTeammate = useCallback(
    (input = {}) => {
      const teammate = createTeammate(input)
      addItem(teammate)
      return teammate
    },
    [addItem],
  )

  const updateTeammate = useCallback(
    (id, updates) => {
      updateItem(id, updates)
    },
    [updateItem],
  )

  const getTeammateById = useCallback(
    (id) => items.find((teammate) => teammate.id === id) ?? null,
    [items],
  )

  return {
    teammates: items,
    addTeammate,
    updateTeammate,
    removeTeammate: removeItem,
    getTeammateById,
  }
}
