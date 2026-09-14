import { useCallback, useLayoutEffect } from 'react'

const SCROLL_ROOT_ID = 'app-content'
const positions = new Map()

function getScroller() {
  return document.getElementById(SCROLL_ROOT_ID)
}

function rememberScreenScroll(screenKey) {
  const scroller = getScroller()

  if (scroller) {
    positions.set(screenKey, scroller.scrollTop)
  }
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
    getScroller()?.scrollTo({ top: positions.get(screenKey) ?? 0 })
  }, [screenKey])

  return setScreen
}
