import { useCallback, useLayoutEffect } from 'react'

const SCROLL_ROOT_ID = 'app-content'
const positions = new Map()
const forceTopKeys = new Set()

function getScroller() {
  return document.getElementById(SCROLL_ROOT_ID)
}

function rememberScreenScroll(screenKey) {
  const scroller = getScroller()

  if (scroller) {
    positions.set(screenKey, scroller.scrollTop)
  }
}

function applyScroll(screenKey) {
  const top = forceTopKeys.has(screenKey) ? 0 : (positions.get(screenKey) ?? 0)
  forceTopKeys.delete(screenKey)
  getScroller()?.scrollTo({ top })
}

export function scrollScreenToTop(screenKey) {
  forceTopKeys.add(screenKey)
  positions.set(screenKey, 0)

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  getScroller()?.scrollTo({ top: 0 })
}

export function useScreenScroll(screenKey, setScreenState) {
  const setScreen = useCallback(
    (nextScreen) => {
      rememberScreenScroll(screenKey)
      setScreenState(nextScreen)
    },
    [screenKey, setScreenState],
  )

  useLayoutEffect(() => {
    applyScroll(screenKey)
  }, [screenKey])

  return setScreen
}
