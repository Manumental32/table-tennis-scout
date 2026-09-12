import { useCallback, useState } from 'react'
import { readJson, writeJson } from '../services/storage/storageService'

export function usePersistedList(key) {
  const [items, setItems] = useState(() => {
    const storedItems = readJson(key, [])
    return Array.isArray(storedItems) ? storedItems : []
  })

  const addItem = useCallback(
    (item) => {
      setItems((currentItems) => {
        const nextItems = [...currentItems, item]
        writeJson(key, nextItems)
        return nextItems
      })
    },
    [key],
  )

  const updateItem = useCallback(
    (id, updates) => {
      setItems((currentItems) => {
        const nextItems = currentItems.map((item) =>
          item.id === id ? { ...item, ...updates, id } : item,
        )
        writeJson(key, nextItems)
        return nextItems
      })
    },
    [key],
  )

  const removeItem = useCallback(
    (id) => {
      setItems((currentItems) => {
        const nextItems = currentItems.filter((item) => item.id !== id)
        writeJson(key, nextItems)
        return nextItems
      })
    },
    [key],
  )

  return { items, addItem, updateItem, removeItem }
}
