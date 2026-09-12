import { createClient } from '@supabase/supabase-js'

let client = null

export function isValidAnonKey(key) {
  if (!key) {
    return false
  }

  if (key.startsWith('sb_publishable_')) {
    return true
  }

  const parts = key.split('.')
  return parts.length === 3 && parts.every(Boolean)
}

export function getRemoteConfigError() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    return ''
  }

  if (!isValidAnonKey(key)) {
    return 'La anon key de .env está incompleta. En Supabase → Project Settings → API copiá la clave completa (anon public). Tiene dos puntos o empieza con sb_publishable_.'
  }

  return ''
}

export function isRemoteStorageEnabled() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  )
}

export function getSupabaseClient() {
  if (!isRemoteStorageEnabled()) {
    return null
  }

  if (!client) {
    client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    )
  }

  return client
}
