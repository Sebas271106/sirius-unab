import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { ids } = await req.json() as { ids: string[] }
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ profiles: [] })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url) {
      return NextResponse.json({ error: 'Server not configured: missing URL' }, { status: 500 })
    }

    let supabaseAdmin
    let canUseAdmin = false

    if (serviceKey) {
      supabaseAdmin = createClient(url, serviceKey)
      canUseAdmin = true
    } else if (anonKey) {
      // Fallback: usar anon key para acceder a public.users (RLS debe permitir SELECT)
      console.warn('user-profiles: SUPABASE_SERVICE_ROLE_KEY missing, using ANON key; admin lookup disabled')
      supabaseAdmin = createClient(url, anonKey)
    } else {
      return NextResponse.json({ error: 'Server not configured: missing keys' }, { status: 500 })
    }

    // First, try to read public profiles
    const { data: profilesRows, error: profilesErr } = await supabaseAdmin
      .from('users')
      .select('id, full_name, career, email')
      .in('id', ids)

    if (profilesErr) {
      // Log minimal info, don't expose sensitive details
      console.error('profilesErr', profilesErr.message)
    }
    console.log('user-profiles: query mode', canUseAdmin ? 'service' : 'anon', { idsCount: ids.length, returned: (profilesRows || []).length })

    const profilesById: Record<string, { id: string; full_name?: string | null; career?: string | null; email?: string | null }> = {}

    for (const p of profilesRows || []) {
      profilesById[p.id] = { id: p.id, full_name: p.full_name, career: p.career, email: p.email }
    }

    // For missing ids, try to fetch email from auth via Admin API (only if service role is available)
    const missingIds = ids.filter((id) => !profilesById[id])

    if (canUseAdmin && missingIds.length > 0) {
      for (const mid of missingIds) {
        try {
          const { data, error } = await supabaseAdmin.auth.admin.getUserById(mid)
          if (error) {
            console.error('admin.getUserById error', error.message)
            continue
          }
          const email = data?.user?.email || null
          profilesById[mid] = { id: mid, email }
        } catch (e) {
          console.error('admin.getUserById exception', e)
        }
      }
      // Persistir en public.users los perfiles con email faltantes para evitar futuros vacíos
      try {
        const toUpsert = missingIds
          .filter((mid) => !!profilesById[mid]?.email)
          .map((mid) => ({ id: mid, email: profilesById[mid]?.email }))
        if (toUpsert.length > 0) {
          const { error: upErr } = await supabaseAdmin
            .from('users')
            .upsert(toUpsert, { onConflict: 'id' })
          if (upErr) {
            console.error('user-profiles: upsert missing profiles error', upErr.message)
          } else {
            console.log('user-profiles: upserted missing profiles', { count: toUpsert.length })
          }
        }
      } catch (e) {
        console.error('user-profiles: upsert exception', e)
      }
    }

    // Return as array
    const result = Object.values(profilesById)
    return NextResponse.json({ profiles: result })
  } catch (e) {
    console.error('user-profiles route error', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}