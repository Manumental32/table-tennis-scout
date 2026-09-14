import { useCallback, useMemo } from 'react'
import { STORAGE_KEYS } from '../services/storage/storageService'
import { getLocalDateKey } from '../utils/trainingSession'
import { usePersistedList } from './usePersistedList'

export function useTrainingDayProgress(trainingId) {
  const { items, addItem, updateItem } = usePersistedList(
    STORAGE_KEYS.TRAINING_PROGRESS,
  )
  const today = getLocalDateKey()
  const record = items.find((item) => item.id === trainingId)
  const completedIds = useMemo(() => {
    if (!record || record.date !== today || !Array.isArray(record.completedDrillIds)) {
      return []
    }

    return record.completedDrillIds
  }, [record, today])

  const writeProgress = useCallback(
    (nextIds) => {
      if (!trainingId) {
        return
      }

      const payload = {
        date: today,
        completedDrillIds: nextIds,
      }

      if (items.some((item) => item.id === trainingId)) {
        updateItem(trainingId, payload)
        return
      }

      addItem({ id: trainingId, ...payload })
    },
    [addItem, items, today, trainingId, updateItem],
  )

  const isCompleted = useCallback(
    (drillId) => completedIds.includes(drillId),
    [completedIds],
  )

  const toggleCompleted = useCallback(
    (drillId) => {
      if (!drillId) {
        return completedIds
      }

      const nextIds = completedIds.includes(drillId)
        ? completedIds.filter((id) => id !== drillId)
        : [...completedIds, drillId]

      writeProgress(nextIds)
      return nextIds
    },
    [completedIds, writeProgress],
  )

  const markCompleted = useCallback(
    (drillId) => {
      if (!drillId || completedIds.includes(drillId)) {
        return completedIds
      }

      const nextIds = [...completedIds, drillId]
      writeProgress(nextIds)
      return nextIds
    },
    [completedIds, writeProgress],
  )

  return {
    completedIds,
    isCompleted,
    toggleCompleted,
    markCompleted,
  }
}
