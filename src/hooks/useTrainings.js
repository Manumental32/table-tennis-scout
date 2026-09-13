import { useCallback, useMemo } from 'react'
import { STORAGE_KEYS } from '../services/storage/storageService'
import { createTraining } from '../utils/dataModels'
import { mergeTrainingCatalog } from '../utils/trainings'
import { usePersistedList } from './usePersistedList'

export function useTrainings() {
  const { items, addItem, updateItem, removeItem } = usePersistedList(
    STORAGE_KEYS.TRAININGS,
  )

  const trainings = useMemo(() => mergeTrainingCatalog(items), [items])

  const addTraining = useCallback(
    (input = {}) => {
      const training = createTraining({ ...input, isCatalog: false })
      addItem(training)
      return training
    },
    [addItem],
  )

  const saveTraining = useCallback(
    (id, input = {}) => {
      const training = createTraining({ ...input, id, isCatalog: false })
      const exists = items.some((item) => item.id === id)

      if (exists) {
        updateItem(id, training)
      } else {
        addItem(training)
      }

      return training
    },
    [addItem, items, updateItem],
  )

  const getTrainingById = useCallback(
    (id) => trainings.find((training) => training.id === id) ?? null,
    [trainings],
  )

  const isStoredTraining = useCallback(
    (id) => items.some((item) => item.id === id),
    [items],
  )

  return {
    trainings,
    addTraining,
    saveTraining,
    updateTraining: updateItem,
    removeTraining: removeItem,
    getTrainingById,
    isStoredTraining,
  }
}
