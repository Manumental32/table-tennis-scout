import { useCallback } from 'react'
import { STORAGE_KEYS } from '../services/storage/storageService'
import { createTournament } from '../utils/dataModels'
import { usePersistedList } from './usePersistedList'

export function useTournament() {
  const { items, addItem, updateItem, removeItem } = usePersistedList(
    STORAGE_KEYS.TOURNAMENTS,
  )

  const addTournament = useCallback(
    (input = {}) => {
      const tournament = createTournament(input)
      addItem(tournament)
      return tournament
    },
    [addItem],
  )

  const updateTournament = useCallback(
    (id, updates) => {
      updateItem(id, updates)
    },
    [updateItem],
  )

  const getTournamentById = useCallback(
    (id) => items.find((tournament) => tournament.id === id) ?? null,
    [items],
  )

  return {
    tournaments: items,
    addTournament,
    updateTournament,
    removeTournament: removeItem,
    getTournamentById,
  }
}
