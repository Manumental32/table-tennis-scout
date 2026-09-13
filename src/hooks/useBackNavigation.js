import { useEffect } from 'react'

const LOCK_STATE = { scoutTt: true }

let pageHandler = null
let fallbackHandler = null

function handlePopState() {
  window.history.pushState(LOCK_STATE, '')

  if (pageHandler?.() === true) {
    return
  }

  fallbackHandler?.()
}

export function useLockHardwareBack() {
  useEffect(() => {
    window.history.pushState(LOCK_STATE, '')
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])
}

export function useBackHandler(handler) {
  useEffect(() => {
    pageHandler = handler

    return () => {
      if (pageHandler === handler) {
        pageHandler = null
      }
    }
  }, [handler])
}

export function useBackFallback(handler) {
  useEffect(() => {
    fallbackHandler = handler

    return () => {
      if (fallbackHandler === handler) {
        fallbackHandler = null
      }
    }
  }, [handler])
}
