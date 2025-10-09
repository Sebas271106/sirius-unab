import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Expose whether Supabase is properly configured via env vars
export const SUPABASE_CONFIGURED = !!(url && key)

if (!SUPABASE_CONFIGURED) {
  // Helpful warning; avoids leaking any secrets
  console.warn('Supabase URL or anon key is not set. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
}

// Lazy-initialize the client to avoid SSR/prerender errors when env vars are missing.
let client: SupabaseClient | null = null
function ensureClient(): SupabaseClient {
  if (client) return client
  if (!url || !key) {
    // Don't initialize during server-side prerender; only fail when actually used at runtime
    throw new Error('Supabase URL or anon key is not configured')
  }
  client = createClient(url, key)
  return client
}

// Export a proxied client that initializes on first use, preventing module-eval errors at build time
const dummy = {} as SupabaseClient
const handler: ProxyHandler<SupabaseClient> = {
  get(_target, prop, receiver) {
    const c = ensureClient()
    const value = Reflect.get(c as object, prop, receiver as object)
    if (typeof value === 'function') {
      type AnyFn = (this: SupabaseClient, ...args: unknown[]) => unknown
      return (value as AnyFn).bind(c)
    }
    return value
  },
}
export const supabase = new Proxy(dummy, handler)