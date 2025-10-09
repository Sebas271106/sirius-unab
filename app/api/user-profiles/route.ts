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

    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const supabaseAdmin = createClient(url, serviceKey)

    // First, try to read public profiles
    const { data: profilesRows, error: profilesErr } = await supabaseAdmin
      .from('users')
      .select('id, full_name, career, email')
      .in('id', ids)

    if (profilesErr) {
      // Log minimal info, don't expose sensitive details
      console.error('profilesErr', profilesErr.message)
    }

    const profilesById: Record<string, { id: string; full_name?: string | null; career?: string | null; email?: string | null }> = {}

    for (const p of profilesRows || []) {
      profilesById[p.id] = { id: p.id, full_name: p.full_name, career: p.career, email: p.email }
    }

    // For missing ids, try to fetch email from auth via Admin API
    const missingIds = ids.filter((id) => !profilesById[id])

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

    // Return as array
    const result = Object.values(profilesById)
    return NextResponse.json({ profiles: result })
  } catch (e) {
    console.error('user-profiles route error', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}