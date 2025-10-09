import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Expose whether Supabase is properly configured via env vars
export const SUPABASE_CONFIGURED = !!(url && key)

if (!SUPABASE_CONFIGURED) {
  // Helpful warning; avoids leaking any secrets
  console.warn('Supabase URL or anon key is not set. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
}

// Always export a client instance for TypeScript safety.
// If not configured, this will still create a client with empty values; calls will fail with clear errors.
export const supabase = createClient(url || '', key || '')