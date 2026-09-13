import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  flushPendingSync,
  hydrateRemoteStore,
  pauseRemoteSync,
  resumeRemoteSync,
  setActiveUserId,
  upsertRemoteKey,
} from '../services/storage/remoteStore'
import { registerRemoteWriter } from '../services/storage/storageService'
import {
  getSupabaseClient,
  isRemoteStorageEnabled,
} from '../services/supabase/client'
import {
  createDevSession,
  isLocalDevHost,
  readDevSkip,
  writeDevSkip,
} from '../utils/devAuth'

registerRemoteWriter((key, value) => {
  void upsertRemoteKey(key, value)
})

export const AuthContext = createContext(null)

const AUTH_ERRORS = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirmá el email antes de entrar.',
  'User already registered': 'Ese email ya tiene una cuenta.',
  'Invalid API key': 'La anon key de Supabase no es válida. Copiá la clave completa en .env y reiniciá npm run dev.',
}

function getAuthErrorMessage(error) {
  if (!error) {
    return ''
  }

  if (error.message.includes('Invalid API key')) {
    return AUTH_ERRORS['Invalid API key']
  }

  return AUTH_ERRORS[error.message] ?? 'No se pudo entrar. Probá de nuevo.'
}

function clearRemoteSession() {
  pauseRemoteSync()
  setActiveUserId(null)
  resumeRemoteSync()
}

export function useAuthState() {
  const enabled = isRemoteStorageEnabled()
  const canSkipLocal = isLocalDevHost()
  const [ready, setReady] = useState(() => !enabled || readDevSkip())
  const [session, setSession] = useState(() =>
    readDevSkip() ? createDevSession() : null,
  )
  const [hydrated, setHydrated] = useState(() => !enabled || readDevSkip())
  const [hydrateError, setHydrateError] = useState('')

  const runHydrate = useCallback(async (userId) => {
    if (!enabled || !userId) {
      setHydrated(true)
      return
    }

    setHydrateError('')

    try {
      await hydrateRemoteStore(userId)
      setHydrated(true)
    } catch {
      setHydrateError('No se pudo sincronizar. Tus datos de este dispositivo siguen.')
    }
  }, [enabled])

  useEffect(() => {
    if (session?.isDevSkip) {
      pauseRemoteSync()
      setActiveUserId(null)
    }
  }, [session])

  useEffect(() => {
    if (!enabled) {
      setActiveUserId(null)
      return undefined
    }

    const client = getSupabaseClient()

    const { data } = client.auth.onAuthStateChange((event, nextSession) => {
      if (readDevSkip() && !nextSession) {
        pauseRemoteSync()
        setActiveUserId(null)
        setSession(createDevSession())
        setReady(true)
        setHydrated(true)
        setHydrateError('')
        return
      }

      if (nextSession && readDevSkip()) {
        writeDevSkip(false)
      }

      setSession(nextSession)
      setReady(true)

      if (event === 'SIGNED_OUT' || !nextSession) {
        clearRemoteSession()
        setHydrated(false)
        setHydrateError('')
        return
      }

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        void runHydrate(nextSession.user.id)
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [enabled, runHydrate])

  useEffect(() => {
    if (!enabled || !hydrated) {
      return undefined
    }

    function handleOnline() {
      void flushPendingSync()
    }

    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [enabled, hydrated])

  const applySession = useCallback(
    (nextSession) => {
      if (!nextSession) {
        return
      }

      setSession(nextSession)
      setReady(true)
      void runHydrate(nextSession.user.id)
    },
    [runHydrate],
  )

  const signIn = useCallback(async (email, password) => {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: getAuthErrorMessage(error) }
    }

    applySession(data.session)
    return { error: '', status: 'signed_in' }
  }, [applySession])

  const signUp = useCallback(async (email, password) => {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.signUp({ email, password })

    if (error) {
      return { error: getAuthErrorMessage(error) }
    }

    if (data.session) {
      applySession(data.session)
      return { error: '', status: 'signed_in' }
    }

    const identities = data.user?.identities ?? []

    if (data.user && identities.length === 0) {
      return { error: '', status: 'already_registered' }
    }

    return { error: '', status: 'needs_confirmation' }
  }, [applySession])

  const enterLocalDev = useCallback(() => {
    if (!isLocalDevHost()) {
      return
    }

    writeDevSkip(true)
    pauseRemoteSync()
    setActiveUserId(null)
    setSession(createDevSession())
    setReady(true)
    setHydrated(true)
    setHydrateError('')
  }, [])

  const signOut = useCallback(async () => {
    if (session?.isDevSkip) {
      writeDevSkip(false)
      setSession(null)
      setHydrated(!enabled)
      clearRemoteSession()
      return
    }

    const client = getSupabaseClient()
    await client.auth.signOut()
  }, [enabled, session])

  const retryHydrate = useCallback(() => {
    return runHydrate(session?.user?.id)
  }, [runHydrate, session])

  const skipHydrate = useCallback(() => {
    if (session?.user?.id) {
      setActiveUserId(session.user.id)
    }

    setHydrateError('')
    setHydrated(true)
  }, [session])

  return useMemo(
    () => ({
      enabled,
      ready,
      session,
      hydrated,
      hydrateError,
      canSkipLocal,
      enterLocalDev,
      signIn,
      signUp,
      signOut,
      retryHydrate,
      skipHydrate,
    }),
    [
      enabled,
      ready,
      session,
      hydrated,
      hydrateError,
      canSkipLocal,
      enterLocalDev,
      signIn,
      signUp,
      signOut,
      retryHydrate,
      skipHydrate,
    ],
  )
}

export function useAuth() {
  const auth = useContext(AuthContext)

  if (!auth) {
    throw new Error('useAuth requires AuthProvider')
  }

  return auth
}
