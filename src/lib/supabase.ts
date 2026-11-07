import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

function isPrivilegedKey(value: string) {
  if (value.startsWith('sb_secret_')) return true
  try {
    const payload = value.split('.')[1]
    return payload ? JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).role === 'service_role' : false
  } catch {
    return false
  }
}

export const hasSupabaseSettings = Boolean(url || key)
export let supabaseConfigurationError = ''
let clientPromise: Promise<SupabaseClient> | undefined

if (hasSupabaseSettings) {
  try {
    if (!url || !key || isPrivilegedKey(key)) throw new Error('Invalid browser connection settings')
    if (!['https:', 'http:'].includes(new URL(url).protocol)) throw new Error('Invalid project URL')
  } catch {
    supabaseConfigurationError = 'The guest book is not ready yet. Please try again later.'
  }
}

// Download the database SDK only when the guest book needs it.
export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!hasSupabaseSettings || supabaseConfigurationError) return null
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })).catch(error => {
    clientPromise = undefined
    throw error
  })
  return clientPromise
}
